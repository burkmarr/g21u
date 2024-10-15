const html = `
  <div id="navbar">
    <a href="index.html">Record</a>
    <a href="options.html">Options</a>
  </div>
`
export function menu () {
  document.getElementById('menu').innerHTML = html
}