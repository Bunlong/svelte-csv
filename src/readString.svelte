<script context="module">
  import PapaParse from 'papaparse';

  export function readString(str, options) {
    return PapaParse.parse(str, options);
  }
</script>
