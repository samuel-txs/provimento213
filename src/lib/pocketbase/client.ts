import PocketBase from 'pocketbase'

const pbUrl =
  import.meta.env.VITE_POCKETBASE_URL ||
  'https://landing-page-cartorios-cnj-0e353.shrd00.internal.goskip.dev'
const pb = new PocketBase(pbUrl)
pb.autoCancellation(false)

export default pb
