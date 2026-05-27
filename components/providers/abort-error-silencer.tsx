/**
 * Browser-level swallow for benign AbortErrors.
 *
 * Renders an inline `<script>` so the handlers register *during HTML parse*,
 * before React, Firebase, or Next's dev overlay attach their own. That timing
 * matters: a useEffect-based silencer misses aborts that fire during the
 * first hydration tick (Firebase Auth popup teardown, Next prefetch races).
 *
 * Real errors are untouched — we only swallow events whose error shape says
 * "AbortError" or carries one of the standard abort messages.
 */
export function AbortErrorSilencer() {
  const src = `(function(){
  function isBenignAbort(t){
    if(!t) return false;
    if(t.name==='AbortError') return true;
    var m=t.message;
    if(typeof m!=='string') return false;
    return m.indexOf('aborted a request')>=0
      || m.indexOf('aborted without reason')>=0
      || m.indexOf('The user aborted')>=0
      || m.indexOf('The operation was aborted')>=0
      || m.indexOf('signal is aborted')>=0;
  }
  window.addEventListener('error', function(e){
    if(isBenignAbort(e.error) || isBenignAbort({message:e.message})){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    if(isBenignAbort(e.reason)){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
})();`;
  return <script dangerouslySetInnerHTML={{ __html: src }} />;
}
