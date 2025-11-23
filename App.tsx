import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Code2, 
  Globe, 
  Lock, 
  Search, 
  Terminal, 
  Zap,
  Eye,
  ShieldCheck,
  Info
} from 'lucide-react';
import { scanWebsite } from './services/webScanner';
import { analyzeWithGemini } from './services/geminiService';
import { ScanMetrics, AIAnalysis, ScanStatus } from './types';
import RadialScore from './components/RadialScore';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [metrics, setMetrics] = useState<ScanMetrics | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to remove any markdown symbols if the AI ignores instructions
  const cleanText = (text: string) => {
    return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
  };

  const handleScan = async () => {
    if (!url) {
      setErrorMsg("Please enter a valid URL.");
      return;
    }
    
    // Reset state
    setStatus('scanning');
    setErrorMsg(null);
    setMetrics(null);
    setAnalysis(null);

    // 1. Scan (Fetch)
    const scanResult = await scanWebsite(url);
    setMetrics(scanResult);

    // 2. Analyze (AI)
    setStatus('analyzing');
    try {
      const aiResult = await analyzeWithGemini(scanResult, logs);
      setAnalysis(aiResult);
      setStatus('complete');
    } catch (e) {
      console.error(e);
      setStatus('error');
      setErrorMsg("AI Analysis failed. Please try again.");
    }
  };

  const clearAll = () => {
    setUrl('');
    setLogs('');
    setStatus('idle');
    setMetrics(null);
    setAnalysis(null);
    setErrorMsg(null);
  };

  const getStatusColor = (code: number | null) => {
    if (!code) return 'text-slate-400';
    if (code >= 200 && code < 300) return 'text-green-500';
    if (code >= 400) return 'text-red-500';
    return 'text-amber-500';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">AutoWebsite Monitor</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AI Systems Operational
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Input & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Check a website</h2>
              
              <div className="space-y-4">
                {/* URL Input */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-slate-400 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="url"
                      id="url"
                      className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Logs Input */}
                <div>
                  <label htmlFor="logs" className="block text-sm font-medium text-slate-400 mb-2 flex justify-between">
                    <span>JS Console Logs</span>
                    <span className="text-slate-600 text-xs uppercase tracking-wider">Optional</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Terminal className="h-5 w-5 text-slate-500" />
                    </div>
                    <textarea
                      id="logs"
                      rows={4}
                      className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="Paste browser console output here..."
                      value={logs}
                      onChange={(e) => setLogs(e.target.value)}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={handleScan}
                    disabled={status === 'scanning' || status === 'analyzing'}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'scanning' && 'Scanning Network...'}
                    {status === 'analyzing' && 'AI Analyzing...'}
                    {(status === 'idle' || status === 'complete' || status === 'error') && (
                      <>
                        <Zap className="w-4 h-4" /> Run Diagnosis
                      </>
                    )}
                  </button>
                  <button 
                    onClick={clearAll}
                    className="w-full py-2 px-4 text-slate-500 hover:text-white transition-colors text-sm"
                  >
                    Clear form
                  </button>
                </div>

                <p className="text-xs text-slate-600 text-center leading-relaxed">
                  We verify connectivity and analyze the page structure. <br/>All processing happens locally or via AI API.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {status === 'idle' && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 ring-1 ring-slate-800">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No scan data yet</h3>
                <p className="text-slate-500 max-w-sm">Enter a URL on the left and start the diagnosis to receive technical stats and AI-powered insights.</p>
              </div>
            )}

            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Technical Overview Card */}
                <div className="col-span-1 md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur">
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-blue-400" />
                      Technical Overview
                    </h3>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">GET</span>
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Status</div>
                      <div className={`text-2xl font-mono font-bold ${getStatusColor(metrics.statusCode)}`}>
                        {metrics.statusCode || 'N/A'}
                      </div>
                      <div className="text-sm text-slate-400">
                        {metrics.statusCode === 200 ? 'OK' : metrics.fetchError ? 'Fetch Failed' : 'Unknown'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Latency</div>
                      <div className="text-2xl font-mono font-bold text-white">
                        {metrics.responseTimeMs ? `${metrics.responseTimeMs}ms` : '-'}
                      </div>
                      <div className="text-sm text-slate-400">Round trip time</div>
                    </div>

                    <div className="space-y-1 md:col-span-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Fetch Mode</div>
                      <div className="text-xl font-medium text-white">
                        {metrics.fetchError ? 'Restricted' : 'Direct'}
                      </div>
                      {metrics.fetchError && (
                        <div className="text-xs text-red-400 mt-1 max-w-[200px]">
                          {metrics.fetchError}. Analysis limited to URL pattern & logs.
                        </div>
                      )}
                    </div>

                    {/* Headers & HTML Preview */}
                    <div className="md:col-span-3 mt-4 space-y-4">
                      {Object.keys(metrics.headers).length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs text-slate-500 uppercase font-semibold">Response Headers</label>
                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-x-auto">
                            <pre className="text-xs text-slate-400 font-mono">
                              {Object.entries(metrics.headers).slice(0, 4).map(([k, v]) => (
                                <div key={k}><span className="text-blue-400">{k}:</span> {v}</div>
                              ))}
                              {Object.keys(metrics.headers).length > 4 && <div className="text-slate-600 mt-1">... and more</div>}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      {metrics.htmlSnippet && (
                        <div className="space-y-2">
                          <label className="text-xs text-slate-500 uppercase font-semibold">HTML Snippet</label>
                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-hidden max-h-32 relative group">
                            <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap break-all">
                              {metrics.htmlSnippet.substring(0, 600)}...
                            </pre>
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loading State for Analysis */}
                {status === 'analyzing' && (
                   <div className="col-span-1 md:col-span-2 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center animate-pulse">
                     <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                     <h4 className="text-lg text-white font-medium">Gemini is analyzing...</h4>
                     <p className="text-slate-500 text-sm mt-2">Translating technical data into plain English.</p>
                   </div>
                )}

                {/* AI REPORT */}
                {analysis && (
                  <div className="col-span-1 md:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-px bg-slate-800 flex-grow"></div>
                      <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">AI Intelligence Report</span>
                      <div className="h-px bg-slate-800 flex-grow"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Score Card */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Activity className="w-24 h-24 text-white" />
                        </div>
                        <h3 className="text-sm text-slate-400 font-medium mb-4">Overall Health</h3>
                        <RadialScore score={analysis.healthScore} />
                        <div className="mt-4 text-center">
                          <p className="text-sm text-slate-400">
                            {analysis.healthScore >= 80 ? 'Excellent condition' : analysis.healthScore >= 50 ? 'Needs improvements' : 'Critical issues found'}
                          </p>
                        </div>
                      </div>

                      {/* Methodology Block (New) */}
                      <div className="md:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                           <Info className="w-5 h-5 text-slate-400" />
                           <h3 className="text-base font-medium text-slate-300">How is this calculated?</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">We start with a perfect <span className="text-white font-bold">100</span> score. Deductions are applied for:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                           <div className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-slate-800/50">
                             <span className="text-slate-400">Insecure Protocol (HTTP)</span>
                             <span className="font-mono text-red-400 font-bold">-20</span>
                           </div>
                           <div className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-slate-800/50">
                             <span className="text-slate-400">Broken Link (4xx/5xx)</span>
                             <span className="font-mono text-red-400 font-bold">-40</span>
                           </div>
                           <div className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-slate-800/50">
                             <span className="text-slate-400">Browser/CORS Block</span>
                             <span className="font-mono text-amber-400 font-bold">-15</span>
                           </div>
                           <div className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-slate-800/50">
                             <span className="text-slate-400">Console JS Errors</span>
                             <span className="font-mono text-amber-400 font-bold">-15</span>
                           </div>
                           <div className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-slate-800/50">
                             <span className="text-slate-400">Missing/Unverifiable HTML</span>
                             <span className="font-mono text-slate-500 font-bold">-10</span>
                           </div>
                        </div>
                      </div>

                      {/* SEO Card */}
                      <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Search className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white mb-1">SEO & Metadata</h3>
                            <p className="text-sm text-slate-400 mb-3 leading-relaxed">{cleanText(analysis.seo.summary)}</p>
                            <ul className="space-y-2">
                              {analysis.seo.details.map((detail, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                  <CheckCircle2 className="w-4 h-4 text-green-500/80 shrink-0" />
                                  {cleanText(detail)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Accessibility & Privacy Row */}
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Accessibility */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Eye className="w-5 h-5 text-purple-400" />
                            <h3 className="font-medium text-white">Accessibility</h3>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">{cleanText(analysis.accessibility.summary)}</p>
                          <ul className="space-y-2">
                            {analysis.accessibility.details.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></span>
                                {cleanText(item)}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Privacy */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                          <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-xl ${analysis.privacy.level === 'Low concern' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {analysis.privacy.level}
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <Lock className="w-5 h-5 text-amber-400" />
                            <h3 className="font-medium text-white">Privacy & Cookies</h3>
                          </div>
                          <p className="text-sm text-slate-400 mb-4">{cleanText(analysis.privacy.summary)}</p>
                          <ul className="space-y-2">
                             {analysis.privacy.details.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
                                {cleanText(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* JS Errors */}
                      {analysis.jsErrors && (
                         <div className="md:col-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                           <div className="flex items-center gap-2 mb-4">
                             <Terminal className="w-5 h-5 text-red-400" />
                             <h3 className="font-medium text-white">Console Analysis</h3>
                           </div>
                           <p className="text-sm text-slate-400 mb-4">{cleanText(analysis.jsErrors.summary)}</p>
                           <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                             {analysis.jsErrors.details.map((err, i) => (
                               <div key={i} className="font-mono text-xs text-red-300 py-1 border-b border-slate-800/50 last:border-0">
                                 &gt; {cleanText(err)}
                               </div>
                             ))}
                           </div>
                         </div>
                      )}

                      {/* Recommendations */}
                      <div className="md:col-span-3 bg-gradient-to-br from-blue-900/20 to-slate-900/50 border border-blue-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <ShieldCheck className="w-5 h-5 text-blue-400" />
                          <h3 className="font-medium text-white">Recommended Actions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                <ChevronRight className="w-4 h-4 text-blue-400" />
                              </div>
                              <span className="text-sm text-slate-200 leading-relaxed">{cleanText(rec)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;