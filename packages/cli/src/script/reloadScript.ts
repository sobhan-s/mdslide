// Live Reload script
export const RELOAD_SCRIPT = `
<script>
(function(){
  const es = new EventSource('/~live-reload');
  es.onmessage = (e) => { if (e.data === 'reload') location.reload(); };
  es.onerror   = () => setTimeout(() => location.reload(), 2000);
})();
</script>
`;
