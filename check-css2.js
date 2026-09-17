fetch('https://sauvage-kohl.vercel.app/_next/static/css/de5d854266dc3b5c.css')
  .then(r => r.text())
  .then(t => {
    console.log('CSS length:', t.length);
    // Find font-display variable usage
    const matches = t.match(/--font-display[^;]*/g);
    console.log('--font-display refs:', matches);
    // Find h1/h2/h3 font-family
    const hMatches = t.match(/h1\s*{[^}]*}/g);
    console.log('h1 rule:', hMatches);
    const h2Matches = t.match(/h2\s*{[^}]*}/g);
    console.log('h2 rule:', h2Matches);
    const h3Matches = t.match(/h3\s*{[^}]*}/g);
    console.log('h3 rule:', h3Matches);
    // Check for Syne or Fraunces
    const syne = t.match(/Syne/gi);
    console.log('Syne mentions:', syne);
    const fraunces = t.match(/Fraunces/gi);
    console.log('Fraunces mentions:', fraunces);
  })
  .catch(console.error);