/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "mozilla/dom/cache/ManagerId.h"
#include "nsIPrincipal.h"
#include "nsProxyRelease.h"
#include "mozilla/nsRefPtr.h"
#include "nsThreadUtils.h"

namespace mozilla {
namespace dom {
namespace cache {

// static
nsresult
ManagerId::Create(nsIPrincipal* aPrincipal, ManagerId** aManagerIdOut)
{
  MOZ_ASSERT(NS_IsMainThread());

  // The QuotaManager::GetInfoFromPrincipal() has special logic for system
  // and about: principals.  We need to use the same modified origin in
  // order to interpret calls from QM correctly.
  nsCString quotaOrigin;
  nsresult rv = QuotaManager::GetInfoFromPrincipal(aPrincipal,
                                                   nullptr,   //group
                                                   &quotaOrigin,
                                                   nullptr);  // is app
  if (NS_WARN_IF(NS_FAILED(rv))) { return rv; }

  nsRefPtr<ManagerId> ref = new ManagerId(aPrincipal, quotaOrigin);
  ref.forget(aManagerIdOut);

  return NS_OK;
}

already_AddRefed<nsIPrincipal>
ManagerId::Principal() const
{
  MOZ_ASSERT(NS_IsMainThread());
  nsCOMPtr<nsIPrincipal> ref = mPrincipal;
  return ref.forget();
}

ManagerId::ManagerId(nsIPrincipal* aPrincipal, const nsACString& aQuotaOrigin)
    : mPrincipal(aPrincipal)
    , mQuotaOrigin(aQuotaOrigin)
{
  MOZ_ASSERT(mPrincipal);
}

ManagerId::~ManagerId()
{
  // If we're already on the main thread, then default destruction is fine
  if (NS_IsMainThread()) {
    return;
  }

  // Otherwise we need to proxy to main thread to do the release

  // The PBackground worker thread shouldn't be running after the main thread
  // is stopped.  So main thread is guaranteed to exist here.
  nsCOMPtr<nsIThread> mainThread = do_GetMainThread();
  MOZ_ASSERT(mainThread);

  NS_ProxyRelease(mainThread, mPrincipal.forget().take());
}

} // namespace cache
} // namespace dom
} // namespace mozilla
