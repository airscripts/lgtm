'use client';
import { useState } from 'react';
import { Link, Check } from 'lucide-react';
import { COPY_FEEDBACK_MS } from '@/lib/config';

export type CopyShareButtonProps = {
  url: string;
  label?: string;
};

export function CopyShareButton({ url, label = 'Copy share link' }: CopyShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  return (
    <button title={url} onClick={handleCopy} className="btn btn-ghost" style={{ fontFamily: 'inherit' }}>
      {copied ? (
        <>
          <Check size={14} aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Link size={14} aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}
