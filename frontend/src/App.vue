<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const SERVER_PORT = 3000

type PdfSource = {
  file: string
  title: string
  offsetFirstPage?: boolean // start on the right side instead of the left if true
}

// Dynamically import all PDF files from the assets folder
const pdfFiles = import.meta.glob('/assets/*.pdf', { eager: true })

// Generate the pdfSources array from the imported files
const pdfSources: PdfSource[] = Object.keys(pdfFiles).map((filePath) => {
  const fileName = filePath.split('/').pop()?.replace('.pdf', '') || 'Unknown'
  function transformTitle(title: string): string {
    return title
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '); // Split by '-', capitalize each word, and join with a space
  } 
  return {
    file: filePath.replace('/src/', ''), // Adjust path for usage
    title: transformTitle(fileName)
  }
})

const defaultSelectionIndex = 1

const pdfPage1 = ref(null)
const pdfPage2 = ref(null)

// Setting the first (or default) PDF
const pdfSource = ref(pdfSources[defaultSelectionIndex].file)
const skipFirstPage = ref(
  pdfSources[defaultSelectionIndex].offsetFirstPage || false,
)

const { pdf, pages } = usePDF(pdfSource)

const page = ref(1)

const currentPage = computed(() => page.value - (skipFirstPage.value ? 1 : 0))
const nextPage = computed(() => currentPage.value + 1)

onMounted(() => {
  // Create a new EventSource to listen to server-sent events
  const eventSource = new EventSource(`http://localhost:${SERVER_PORT}`)

  // Listen for messages from the server
  eventSource.onmessage = event => {
    console.log('msg from server', event.data)
    if (event.data === 'NEXT_PAGE') {
      page.value = currentPage.value < pages.value - 1 ? page.value + 2 : 1
    }
  }

  // Clean up the EventSource when the component is unmounted
  onUnmounted(() => {
    eventSource.close()
  })
})

// Remove the reload calls as they are not supported
onresize = () => {
  if (!!pdfPage1.value) {
    console.log('Reloading pdfPage1')
    pdfPage1.value.reload()
  }
  if (!!pdfPage2.value) {
    console.log('Reloading pdfPage2')
    pdfPage2.value.reload()
  }
}

// Parse the index as a number to fix type issues
function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const index = parseInt(target.value, 10) // Ensure index is a number
  pdfSource.value = pdfSources[index].file
  page.value = 1
  skipFirstPage.value = pdfSources[index].offsetFirstPage || false
}
</script>

<template>
  <main>
    <aside>
      <select
        name="piano-pieces"
        id="piano-pieces"
        @change="onChange($event)"
        v-model="defaultSelectionIndex"
      >
        <option
          v-for="(pdf, index) in pdfSources"
          :value="index"
          :key="pdf.file"
        >
          {{ pdf.title }}
        </option>
      </select>
      <button @click="page = page > 1 ? page - 2 : page">Prev</button>
      <span>{{ currentPage }}-{{ page }} / {{ pages }}</span>
      <button @click="page = currentPage < pages - 1 ? page + 2 : page">
        Next
      </button>
      {{ skipFirstPage }} ; {{ currentPage }} & {{ nextPage }}
    </aside>
    <div id="content">
      <div style="width: 100%">
        <VuePDF
          ref="pdfPage1"
          :pdf="pdf"
          :page="currentPage"
          fit-parent
          v-if="currentPage > 0"
        />
      </div>
      <div style="width: 100%">
        <VuePDF
          v-if="page < pages"
          ref="pdfPage2"
          :pdf="pdf"
          :page="nextPage"
          fit-parent
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
#content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* padding: 0 2rem; */
}
aside {
  position: fixed;
  z-index: 1000;
}
</style>
