<script>
  import * as Papa from 'papaparse';

  export function readRemoteFile(url, options) {
    Papa.parse(url, Object.assign({}, { download: true }, options));
  }
</script>
