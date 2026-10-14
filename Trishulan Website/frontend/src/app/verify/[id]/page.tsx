"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Building2, CircleAlert, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import type { UserRole } from "@/types";

interface VerificationRecord {
  id: string;
  name: string;
  companyName: string | null;
  role: UserRole;
  verifiedSeller: boolean;
}

type VerificationState = "loading" | "valid" | "invalid" | "unavailable";

export default function VerifyDigitalIDPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [status, setStatus] = useState<VerificationState>("loading");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function verifyMember() {
      setStatus("loading");

      try {
        const response = await fetch(`/api/digital-id/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (response.status === 404) {
          if (isCurrentRequest) setStatus("invalid");
          return;
        }
        if (!response.ok) {
          throw new Error(`Digital ID verification failed with status ${response.status}`);
        }

        const member: VerificationRecord = await response.json();
        if (isCurrentRequest) {
          setRecord(member);
          setStatus("valid");
        }
      } catch (error) {
        console.error("Unable to verify the digital ID:", error);
        if (isCurrentRequest) setStatus("unavailable");
      }
    }

    void verifyMember();
    return () => {
      isCurrentRequest = false;
    };
  }, [id, retryCount]);

  return (
    <section className="wrap py-14 sm:py-20">
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-line bg-card shadow-xl">
        <div className={`p-7 text-center sm:p-10 ${
          status === "valid" ? "bg-emerald-50" : "bg-slate-50"
        }`}>
          {status === "loading" && (
            <>
              <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-accent" aria-hidden="true" />
              <h1 className="mt-4 text-2xl font-black text-ink">Checking member record</h1>
              <p className="mt-2 text-sm text-muted">Connecting to Trishulan&apos;s verification service.</p>
            </>
          )}

          {status === "valid" && record && (
            <>
              <BadgeCheck className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[.16em] text-emerald-800">
                Official Trishulan record found
              </p>
              <h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">Digital ID verified</h1>
              <p className="mt-2 text-sm text-muted">
                This member ID matches an active Trishulan account record.
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <CircleAlert className="mx-auto h-14 w-14 text-rose-600" aria-hidden="true" />
              <h1 className="mt-4 text-2xl font-black text-ink">ID could not be verified</h1>
              <p className="mt-2 text-sm text-muted">
                No Trishulan member record matches this ID. Check the card or contact support.
              </p>
            </>
          )}

          {status === "unavailable" && (
            <>
              <CircleAlert className="mx-auto h-14 w-14 text-amber-600" aria-hidden="true" />
              <h1 className="mt-4 text-2xl font-black text-ink">Verification is temporarily unavailable</h1>
              <p className="mt-2 text-sm text-muted">We could not reach the verification service.</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c2410a]"
              >
                Try again
              </button>
            </>
          )}
        </div>

        {status === "valid" && record && (
          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Member / Representative</p>
                <p className="font-bold text-ink">{record.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Company / Firm</p>
                <p className="font-bold text-ink">{record.companyName || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Account type</p>
                <p className="font-bold text-ink">
                  {record.role === "SELLER" ? "Seller" : "Buyer"} member
                  {record.role === "SELLER" && (
                    <span className="font-medium text-muted">
                      {" · "}{record.verifiedSeller ? "Verified seller" : "Seller verification pending"}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="border-t border-line pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Trishulan Member ID</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">{record.id}</p>
            </div>
          </div>
        )}

        <div className="border-t border-line px-6 py-4 text-center">
          <Link href="/" className="text-sm font-bold text-accent hover:underline">
            Trishulan Industrial Connect
          </Link>
        </div>
      </div>
    </section>
  );
}
