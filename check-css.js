fetch('https://sauvage-kohl.vercel.app')
  .then(r => r.text())
  .then(t => {
    const links = t.match(/href="([^"]*\.css[^"]*)"/g);
    console.log('CSS links:', links);
    const htmlClass = t.match(/<html[^>]*class="([^"]*)"/);
    console.log('HTML class:', htmlClass ? htmlClass[1] : 'none');
  })
  .catch(console.error);