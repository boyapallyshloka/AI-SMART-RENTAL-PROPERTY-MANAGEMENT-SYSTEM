import React, { useState } from 'react'
import { CheckCircle2, ExternalLink, FileCheck2, LoaderCircle, Search, XCircle } from 'lucide-react'
import { searchTenants } from '../../api/tenantApi'
import { getTenantDocuments, updateTenantDocumentVerification } from '../../api/tenantDocumentApi'
import { Button } from '../ui'

const unwrapList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.content)) return value.content
  return []
}

const displayName = (tenant) =>
  [tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email || `Tenant #${tenant.tenantId}`

const pretty = (value) => String(value || '').replaceAll('_', ' ')

export default function TenantDocumentReviewSection() {
  const [query, setQuery] = useState('')
  const [tenants, setTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [documents, setDocuments] = useState([])
  const [searching, setSearching] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [busyDocumentId, setBusyDocumentId] = useState(null)
  const [busyStatus, setBusyStatus] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSearch = async (event) => {
    event.preventDefault()
    if (!query.trim()) {
      setError('Enter a tenant name, email, or search term.')
      return
    }
    setSearching(true)
    setError('')
    setNotice('')
    setSelectedTenant(null)
    setDocuments([])
    try {
      setTenants(unwrapList(await searchTenants(query)))
    } catch (err) {
      setTenants([])
      setError(err?.message || 'Could not search tenant profiles.')
    } finally {
      setSearching(false)
    }
  }

  const selectTenant = async (tenant) => {
    setSelectedTenant(tenant)
    setDocuments([])
    setLoadingDocuments(true)
    setError('')
    setNotice('')
    try {
      setDocuments(unwrapList(await getTenantDocuments(tenant.tenantId)))
    } catch (err) {
      setError(err?.message || 'Could not load this tenant’s documents.')
    } finally {
      setLoadingDocuments(false)
    }
  }

  const reviewDocument = async (document, status) => {
    if (!selectedTenant || busyDocumentId != null) return
    setBusyDocumentId(document.documentId)
    setBusyStatus(status)
    setError('')
    setNotice('')
    try {
      const updated = await updateTenantDocumentVerification(
        selectedTenant.tenantId,
        document.documentId,
        status
      )
      const result = updated?.data ?? updated
      setDocuments((current) => current.map((item) =>
        item.documentId === document.documentId
          ? { ...item, ...result, verificationStatus: result?.verificationStatus || status }
          : item
      ))
      setNotice(`${document.fileName || pretty(document.documentType)} marked ${pretty(status).toLowerCase()}.`)
    } catch (err) {
      setError(err?.message || `Could not mark the document ${pretty(status).toLowerCase()}.`)
    } finally {
      setBusyDocumentId(null)
      setBusyStatus(null)
    }
  }

  return (
    <section className="space-y-4 border-t border-[#D9E0E6] pt-6">
      <div>
        <h2 className="text-base font-bold text-[#243447]">Tenant Document Review</h2>
        <p className="mt-1 text-xs text-[#5B6875]">Search for a tenant to review uploaded identity and income documents.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tenant by name or email"
          aria-label="Search tenant by name or email"
          className="min-w-0 flex-1 rounded-lg border border-[#D9E0E6] bg-white px-3 py-2 text-sm text-[#243447] outline-none focus:border-[#315A7D]"
        />
        <Button type="submit" variant="primary" isLoading={searching} leftIcon={<Search className="h-4 w-4" />}>
          Search tenants
        </Button>
      </form>

      {error && <p role="alert" className="rounded-md border border-[#F4B4B4] bg-[#FDF2F2] p-3 text-sm text-[#8A2E2C]">{error}</p>}
      {notice && <p role="status" className="rounded-md border border-[#C6DEC8] bg-[#EDF7EE] p-3 text-sm text-[#2A583B]">{notice}</p>}

      {tenants.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <button
              type="button"
              key={tenant.tenantId}
              onClick={() => selectTenant(tenant)}
              className={`rounded-lg border p-3 text-left transition-colors ${selectedTenant?.tenantId === tenant.tenantId ? 'border-[#315A7D] bg-[#EAF2F7]' : 'border-[#D9E0E6] bg-white hover:bg-[#F7F8FA]'}`}
            >
              <span className="block text-sm font-semibold text-[#243447]">{displayName(tenant)}</span>
              <span className="block text-xs text-[#5B6875]">{tenant.email || 'No email'} · Tenant #{tenant.tenantId}</span>
            </button>
          ))}
        </div>
      )}

      {selectedTenant && (
        <div className="overflow-hidden rounded-lg border border-[#D9E0E6] bg-white">
          <div className="border-b border-[#D9E0E6] bg-[#F7F8FA] p-3 text-sm font-semibold text-[#243447]">
            {displayName(selectedTenant)} — Tenant #{selectedTenant.tenantId}
          </div>
          {loadingDocuments ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-[#5B6875]"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading tenant documents…</div>
          ) : documents.length === 0 ? (
            <p className="p-5 text-sm text-[#5B6875]">No uploaded documents found for this tenant.</p>
          ) : (
            <ul className="divide-y divide-[#E7EBEF]">
              {documents.map((document) => (
                <li key={document.documentId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#243447]">{document.fileName || pretty(document.documentType)}</p>
                    <p className="mt-0.5 text-xs text-[#5B6875]">{pretty(document.documentType)} · <span className="font-semibold">{pretty(document.verificationStatus)}</span></p>
                    {document.uploadedAt && <p className="mt-0.5 text-xs text-[#5B6875]">Uploaded {new Date(document.uploadedAt).toLocaleString()}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {document.documentUrl && (
                      <a href={document.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-[#D9E0E6] px-3 py-2 text-xs font-semibold text-[#315A7D] hover:bg-[#F7F8FA]">
                        View file <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Button size="sm" variant="primary" disabled={busyDocumentId != null || document.verificationStatus === 'VERIFIED'} isLoading={busyDocumentId === document.documentId && busyStatus === 'VERIFIED'} onClick={() => reviewDocument(document, 'VERIFIED')} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                      Verify
                    </Button>
                    <Button size="sm" variant="danger" disabled={busyDocumentId != null || document.verificationStatus === 'REJECTED'} isLoading={busyDocumentId === document.documentId && busyStatus === 'REJECTED'} onClick={() => reviewDocument(document, 'REJECTED')} leftIcon={<XCircle className="h-3.5 w-3.5" />}>
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!selectedTenant && tenants.length === 0 && !searching && (
        <div className="flex items-start gap-2 rounded-lg border border-[#D9E0E6] bg-[#F7F8FA] p-3 text-xs text-[#5B6875]">
          <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[#315A7D]" />
          Tenant review uses the existing Super Admin tenant search, document list, and verification-status APIs.
        </div>
      )}
    </section>
  )
}
