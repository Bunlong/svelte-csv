<script>
  import * as Papa from 'papaparse';

  export function jsonToCSV(json, options) {
    return Papa.unparse(json, options);
  }
</script>
