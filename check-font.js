fetch('https://sauvage-kohl.vercel.app')
  .then(r => r.text())
  .then(t => {
    const m = t.match(/<html[^>]*class="([^"]*)"/);
    console.log('HTML class:', m ? m[1] : 'none');
    const f = t.match(/font-family[^;]*var\(--font-display\)[^;]*/g);
    console.log('font-display refs:', f);
  })
  .catch(console.error);