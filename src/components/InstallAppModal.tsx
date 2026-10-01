import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Check,
  X,
  Share2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Copy,
  Globe,
  FileCode,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'apk' | 'ios' | 'source'>('android');

  if (!isOpen) return null;

  const publicUrl = window.location.href.split('?')[0].split('#')[0];

  const handlePromptInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          if (onInstallSuccess) onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <img
              src="/app-logo.jpg"
              alt="StudySnap App Icon"
              className="w-11 h-11 rounded-2xl object-cover shadow-xs border border-blue-500/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Install StudySnap on Your Device
              </h2>
              <p className="text-xs text-slate-500">
                Run fullscreen like a native Android APK without browser bars
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-all cursor-pointer ${
              activePlatform === 'android'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Android Direct Install (1-Tap)
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('apk')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-all cursor-pointer ${
              activePlatform === 'apk'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Generate .APK File
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('ios')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activePlatform === 'ios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            iPhone / iOS
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('source')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activePlatform === 'source'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Project File (.ZIP) & Custom URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: Android Direct Install */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              {deferredPrompt && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-blue-900">
                      Your browser supports 1-click install!
                    </p>
                    <p className="text-[11px] text-blue-700">
                      Click below to add StudySnap directly to your Android home screen.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePromptInstall}
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App Now</span>
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  How to install on Android Chrome:
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Open on your phone:</span> Visit this app's URL in <strong>Google Chrome</strong> on your Android device.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Tap Browser Menu:</span> Tap the three dots <strong>(⋮)</strong> in the top-right corner of Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Select "Install app":</span> Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    No Google Play Store needed! It installs instantly with offline caching and zero storage clutter.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Generate .APK File */}
          {activePlatform === 'apk' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Generate a Standalone Android .APK Package
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You can convert this Progressive Web App into a standard signed <strong>.apk</strong> file in 2 minutes using official tools like <strong>PWABuilder</strong> (maintained by Microsoft & Google):
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-700 space-y-1.5 flex-1">
                    <p className="font-semibold text-slate-900">Copy your application URL:</p>
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                      <span className="font-mono text-[11px] text-slate-600 truncate flex-1">
                        {publicUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Visit PWABuilder:</span> Open{' '}
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline underline-offset-2 inline-flex items-center gap-0.5"
                    >
                      pwabuilder.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and paste your app URL.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Download APK:</span> Click <strong>"Package for Android"</strong>, and it will build and download your ready-to-install <strong>.apk</strong> file.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Open PWABuilder to Download APK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: iOS */}
          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Install on iPhone or iPad
                </h3>
                <p className="text-xs text-slate-600">
                  iOS allows instant home screen installation via Safari:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-700">
                    Open this URL in <strong>Apple Safari</strong> on your iPhone or iPad.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
                    Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> (square with upward arrow).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-700">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Project Source ZIP & Custom URL */}
          {activePlatform === 'source' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Download Project Source Code (.ZIP)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download the complete standalone project file. You can deploy it to <strong>Vercel</strong> or <strong>Netlify</strong> to get your own permanent custom URL or connect your own domain!
                </p>
              </div>

              {/* Direct Download Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <FileCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">studysnap-source.zip</p>
                    <p className="text-[11px] text-blue-100">Full React + Vite + Tailwind + PWA Code (~3.5 MB)</p>
                  </div>
                </div>

                <a
                  href="/studysnap-source.zip"
                  download="studysnap-source.zip"
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Download ZIP</span>
                </a>
              </div>

              {/* Step-by-step to get custom URL */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  How to get your own permanent URL (Free in 2 min):
                </h4>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Download ZIP:</span> Click the button above to download <code>studysnap-source.zip</code> and unzip it on your computer.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Upload to GitHub or Netlify:</span> Drag and drop the unzipped folder into <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">app.netlify.com/drop</a> (instant!) or push to a GitHub repository.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Get your URL:</span> You will get a permanent custom URL like <code>https://studysnap.vercel.app</code> or <code>https://studysnap.netlify.app</code>!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'URL Copied!' : 'Copy App URL to Phone'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] px-4 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
