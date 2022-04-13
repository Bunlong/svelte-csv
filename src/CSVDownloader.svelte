<script lang="ts">
  import PapaParse from 'papaparse';
  import type { ComponentType } from './CSVDownloader';

  export let data;
  export let filename: string = 'filename';
  export let type: ComponentType = 'link';
  export let bom: number = 2;

  function download(data, filename, bom) {
    const bomCode = bom ? '\ufeff' : '';
    let csvContent = null;
    if (typeof data === 'object') {
      csvContent = PapaParse.unparse(data);
    } else {
      csvContent = data;
    }
    const csvData = new Blob([`${bomCode}${csvContent}`], {
      type: 'text/csv;charset=utf-8;'
    });
    let csvURL = null;
    if (navigator.msSaveBlob) {
      csvURL = navigator.msSaveBlob(csvData, `${filename}.csv`);
    } else {
      csvURL = window.URL.createObjectURL(csvData);
    }
    const link = document.createElement('a');
    link.href = csvURL;
    link.setAttribute('download', `${filename}.csv`);
    link.click();
    link.remove();
  }
</script>

{#if type === 'link'}
  <span on:click={() => download(data, filename, bom)} class="link">
    <slot />
  </span>
{:else}
  <button on:click={() => download(data, filename, bom)}>
    <slot />
  </button>
{/if}

<style>
  .link {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }
</style>
