# CSH article decision aids

These patterns are optional tools, not mandatory sections. Use one only when it helps a contractor make a faster or better decision. A typical review should use two or three, not all of them.

## Review frontmatter

Adding `decision` opts a review into the consolidated decision-first presentation. Reviews without it keep the current layout.

```yaml
heroStyle: csh-illustrated
decision:
  primaryStrength: "The one capability that changes the working day."
  biggestCatch: "The limitation a buyer is most likely to discover late."
  userSignal: "The recurring pattern across genuine user feedback, including disagreement."
  nextStep: "A concrete, low-risk way to verify the product against the contractor's workflow."
  pricingNote: "What the headline price includes or leaves out."
```

`userSignal` is a synthesis, not a rating. The supporting prose must name the sources checked and distinguish repeated evidence from isolated complaints.

## Decision table

Use for exact comparisons such as plan differences, workflow tradeoffs, or who should choose what. Do not use a table to restate paragraphs.

```html
<div class="csh-decision-table">
  <table>
    <thead><tr><th>Decision</th><th>Choose this when</th><th>Watch for</th></tr></thead>
    <tbody>
      <tr class="csh-table-winner"><td>Best fit</td><td>...</td><td>...</td></tr>
      <tr class="csh-table-caution"><td>Proceed carefully</td><td>...</td><td>...</td></tr>
    </tbody>
  </table>
</div>
```

## Infographic

Use for a real three-step workflow, buying sequence, or cause-and-effect relationship. Keep each cell to one idea.

```html
<div class="csh-infographic">
  <div><span class="csh-step-number">01</span><h3>Capture</h3><p>...</p></div>
  <div><span class="csh-step-number">02</span><h3>Review</h3><p>...</p></div>
  <div><span class="csh-step-number">03</span><h3>Deliver</h3><p>...</p></div>
</div>
```

## User-evidence signal

Use once, after explaining the evidence base. Name the source set in the label and summarize the pattern in the paragraph.

```html
<aside class="csh-evidence-signal">
  <div class="csh-signal-source">User signal<br />App Store + Reddit</div>
  <p>Users consistently praise ..., while the recurring friction is ...</p>
</aside>
```

## Inline CTA

An inline CTA must be the next useful action created by the surrounding text. It may invite the reader to verify a price, use a trial to test a specific workflow, or read a relevant CSH guide. Never drop an unexplained sales button between paragraphs.

```html
<aside class="csh-inline-cta">
  <div><h3>Test the report workflow first</h3><p>Build one representative job before moving the whole team.</p></div>
  <a href="/go/vendor-official-site/" rel="nofollow sponsored">Check current terms →</a>
</aside>

<aside class="csh-inline-cta is-internal">
  <div><h3>Still comparing?</h3><p>See where the alternatives win and lose.</p></div>
  <a href="/best/example/">Read the comparison →</a>
</aside>
```

## Related read

Use for a single contextual internal link. This is intentionally quieter than an inline CTA.

```html
<div class="csh-related-read">
  <strong>Related field guide</strong>
  <a href="/example/">How to evaluate this category →</a>
</div>
```

## Hero image rules

`heroStyle: csh-illustrated` adds the shared CSH blueprint grid, registration marks, orange print edge, and subtle motion. The source image still carries the meaning and must pass the article image review: correct subject, no malformed people or tools, no fake readable UI, no unexplained logos, useful crop on desktop and mobile, and a static fallback that still works with reduced motion.
