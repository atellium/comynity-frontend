"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MobileHeader from "@/components/layout/MobileHeader";
import { BottomSheetModal } from "@/components/modals";
import { clearAuthTokens } from "@/lib/auth-tokens";
import { fetchCurrentUser, resetAuthentication, saveProfile } from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { MyBusinesses } from "./my-businesses";

const supportNumber = (process.env.NEXT_PUBLIC_COMYNITY_WHATSAPP_NUMBER ?? "919876543210").replace(/\D/g, "");
const supportMessage = encodeURIComponent("Hi Comynity, I need some help.");

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const refreshStarted = useRef(false);
  const [editOpen, setEditOpen] = useState(false);
  const { user, userStatus, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (refreshStarted.current) return;
    refreshStarted.current = true;
    void dispatch(fetchCurrentUser());
  }, [dispatch]);

  function signOut() {
    clearAuthTokens();
    dispatch(resetAuthentication());
    router.replace("/");
  }

  if (!user) return null;

  const initials = (user.full_name || user.phone)
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <div className="min-h-dvh bg-white pb-10 dark:bg-white dark:text-foreground">
    <MobileHeader title="Profile" />
    <main className="mx-auto w-full max-w-3xl px-page pt-3">
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-extrabold text-brand" aria-hidden="true">{initials}</span>
          <div className="min-w-0 flex-1"><h1 className="truncate text-base font-extrabold text-foreground">{user.full_name || "Comynity user"}</h1><p className="mt-1 truncate text-xs font-semibold text-foreground-muted">{user.phone}</p><p className="mt-0.5 truncate text-xs text-foreground-muted">{user.email || "Email not provided"}</p></div>
          {userStatus === "loading" && <i className="fa-solid fa-circle-notch fa-spin text-brand" aria-label="Refreshing profile" />}
          <button type="button" onClick={() => setEditOpen(true)} className="flex h-9 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-xs font-extrabold text-brand"><i className="fa-solid fa-pen" aria-hidden="true" />Edit</button>
        </div>
        {userStatus === "failed" && <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-danger"><span>{error || "Couldn't refresh your profile."}</span><button type="button" onClick={() => void dispatch(fetchCurrentUser())} className="ml-2 font-extrabold underline">Try again</button></div>}
      </section>

      <MyBusinesses />

      <nav className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]" aria-label="Profile links">
        <ProfileMenuLink href="/saved" icon="fa-bookmark" label="Saved items" />
        <ProfileMenuLink href={`https://wa.me/${supportNumber}?text=${supportMessage}`} icon="fa-circle-question" label="Help & support" external />
        <ProfileMenuLink href="/privacy" icon="fa-shield-halved" label="Privacy policy" />
        <ProfileMenuLink href="/terms" icon="fa-file-contract" label="Terms of use" />
        <button type="button" onClick={signOut} className="relative flex h-14 w-full items-center gap-3 px-5 text-left text-sm font-bold text-danger transition-colors before:absolute before:inset-x-4 before:top-0 before:border-t before:border-slate-100 hover:bg-red-50">
          <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-foreground-muted" aria-hidden="true" />
          <span className="flex-1">Logout</span>
        </button>
      </nav>
    </main>
    <EditProfileSheet open={editOpen} name={user.full_name ?? ""} email={user.email ?? ""} phone={user.phone} onClose={() => setEditOpen(false)} />
  </div>;
}

function ProfileMenuLink({ href, icon, label, external = false }: { href: string; icon: string; label: string; external?: boolean }) {
  const content = <><i className={`fa-solid ${icon} w-5 text-center text-foreground-muted`} aria-hidden="true" /><span className="flex-1">{label}</span><i className="fa-solid fa-chevron-right text-[10px] text-foreground-muted" aria-hidden="true" /></>;
  const className = "relative flex h-14 items-center gap-3 px-5 text-sm font-bold text-foreground transition-colors before:absolute before:inset-x-4 before:top-0 before:border-t before:border-slate-100 first:before:hidden hover:bg-brand-50";
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className={className}>{content}</a>
    : <Link href={href} className={className}>{content}</Link>;
}

function EditProfileSheet({ open, name, email, phone, onClose }: { open: boolean; name: string; email: string; phone: string; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState(name);
  const [emailAddress, setEmailAddress] = useState(email);
  const [formError, setFormError] = useState<string | null>(null);
  const saving = useAppSelector((state) => state.auth.profileStatus === "loading");
  const inputClass = "h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-foreground outline-none focus:border-brand";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName.trim()) return setFormError("Name is required.");
    setFormError(null);
    try {
      await dispatch(saveProfile({ full_name: fullName.trim(), email: emailAddress.trim() || undefined })).unwrap();
      onClose();
    } catch (submissionError) {
      setFormError(typeof submissionError === "string" ? submissionError : "Unable to update profile.");
    }
  }

  return <BottomSheetModal open={open} onClose={() => !saving && onClose()} title="Edit profile" closeLabel="Close edit profile">
    <form onSubmit={submit} className="flex flex-col gap-4 bg-white px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5 text-foreground">
      <div><h2 className="text-lg font-extrabold">Edit profile</h2><p className="mt-1 text-xs text-foreground-muted">Update your name and email address.</p></div>
      <label className="flex flex-col gap-1.5 text-sm font-bold">Name<input value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClass} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-bold">Phone<input value={phone} disabled className={`${inputClass} bg-slate-50 text-foreground-muted`} /><span className="text-[11px] font-normal text-foreground-muted">Phone number cannot be changed here.</span></label>
      <label className="flex flex-col gap-1.5 text-sm font-bold">Email<input type="email" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} className={inputClass} /></label>
      {formError && <p role="alert" className="text-xs font-semibold text-danger">{formError}</p>}
      <button type="submit" disabled={saving} className="h-12 rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
    </form>
  </BottomSheetModal>;
}
