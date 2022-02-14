<script>
  import * as Papa from 'papaparse';

  export function readString(str, options) {
    return Papa.parse(str, options);
  }
</script>
