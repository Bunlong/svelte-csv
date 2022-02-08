<script context="module" lang="ts">
  import Barcode from 'svelte-barcode';
</script>

<svelte:head>
  <title>Svelte Barcode - svelte-barcode</title>
</svelte:head>

<script>
  let value = 'svelte-barcode';

  let elementTags = [
    { id: 'img', text: 'img' },
    { id: 'canvas', text: 'canvas' },
    { id: 'svg', text: 'svg' }
  ];
  let selectedElementTag;

  let formats = [
    { id: 'CODE128', text: 'CODE128' },
    { id: 'EAN13', text: 'EAN13' },
    { id: 'CODE39', text: 'CODE39' }
  ];
  let selectedFormat;

  let width = 2;

  let height = 100;

  let text = '';

  let textAligns = [
    { id: 'left', text: 'left' },
    { id: 'center', text: 'center' },
    { id: 'right', text: 'right' }
  ];
  let selectedTextAlign;

  let textPositions = [
    { id: 'bottom', text: 'bottom' },
    { id: 'top', text: 'top' },
  ];
  let selectedTextPosition;

  let textMargin = 2;

  let fontSize = 20;

  let background = '#ffffff';

  let lineColor = '#000000';

  let margin = 10;

</script>

<section>
  <h1>Svelte Barcode</h1>
  <p>A light-weight and high-performance component to generate barcode for Svelte.</p>
</section>

<section>
  <div class="main">
    <form>
      <div class="row">
        <div class="col">
          <label>value:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={value} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>elementTag:</label>
        </div>
        <div class="col">
          <select bind:value={selectedElementTag}>
            {#each elementTags as elementTag}
              <option value={elementTag}>
                {elementTag.text}
              </option>
            {/each}
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>format:</label>
        </div>
        <div class="col">
          <select bind:value={selectedFormat}>
            {#each formats as format}
              <option value={format}>
                {format.text}
              </option>
            {/each}
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>width:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={width} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>height:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={height} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>text:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={text} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>textAlign:</label>
        </div>
        <div class="col">
          <select bind:value={selectedTextAlign}>
            {#each textAligns as textAlign}
              <option value={textAlign}>
                {textAlign.text}
              </option>
            {/each}
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>textPosition:</label>
        </div>
        <div class="col">
          <select bind:value={selectedTextPosition}>
            {#each textPositions as textPosition}
              <option value={textPosition}>
                {textPosition.text}
              </option>
            {/each}
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>textMargin:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={textMargin} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>fontSize:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={fontSize} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>background:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={background} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>lineColor:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={lineColor} />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label>margin:</label>
        </div>
        <div class="col">
          <input type='text' bind:value={margin} />
        </div>
      </div>
    </form>
  </div>

  <Barcode
    value={value}
    elementTag={selectedElementTag ? selectedElementTag.id : null}
    options={{
      format: selectedFormat ? selectedFormat.id : null,
      width: width,
      height: height,
      text: text,
      textAlign: selectedTextAlign ? selectedTextAlign.id : null,
      textPosition: selectedTextPosition ? selectedTextPosition.id : null,
      textMargin: textMargin,
      fontSize: fontSize,
      background: background,
      lineColor: lineColor,
      margin: margin,
    }}
  />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  .main {
    width: 600px;
    margin-top:40px;
    margin-bottom: 60px;
    align-items: flex-start;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .col {
    display: flex;
    flex-direction: column;
  }
</style>
