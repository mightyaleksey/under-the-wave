'use strict'

const assert = require('uvu/assert')
const { test } = require('uvu')

const markdown = require('../plugins/p-markdown')
const { createTestContext, invokePlugin } = require('./_utils')

test('p-markdown', async () => {
  const input = `
---
layout: ./template
---
\`\`\`
code test
\`\`\`

> blockquote test

# heading test

---

- list test
- list test

pagagraph test

| a | b |
|---|---|
| a | b |

**strong test**

*em test*

\`codespan test\`

~del test~

[link test](url)

![image test](url)
  `.trim()

  const output = `
    <pre><code class="code">code test
</code></pre>
<blockquote class="blockquote">
<p class="p">blockquote test</p>
</blockquote>
<h1 id="heading-test" class="heading">heading test</h1>
<hr class="hr">
<ul class="list">
<li>list test</li>
<li>list test</li>
</ul>
<p class="p">pagagraph test</p>
<table class="table">
<thead>
<tr>
<th>a</th>
<th>b</th>
</tr>
</thead>
<tbody><tr>
<td>a</td>
<td>b</td>
</tr>
</tbody></table>
<p class="p"><strong class="strong">strong test</strong></p>
<p class="p"><em class="em">em test</em></p>
<p class="p"><code class="codespan">codespan test</code></p>
<p class="p"><del class="del">del test</del></p>
<p class="p"><a href="url" class="link">link test</a></p>
<p class="p"><img src="url" alt="image test" class="image"></p>
`

  const template = `
    <markdown
      code='code'
      blockquote='blockquote'
      heading='heading'
      hr='hr'
      list='list'
      paragraph='p'
      table='table'

      strong='strong'
      em='em'
      codespan='codespan'
      del='del'
      link='link'
      image='image'
    />
  `

  const context = createTestContext(null, null, template)

  assert.is(await invokePlugin(markdown, input, context), output)
})

test.run()
