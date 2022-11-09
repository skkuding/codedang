<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from './CodeEditor.vue'

const code = ref(`#include <iostream>
using namespace std;

int main() {
  cout << "Hello, world!" << endl;
  return 0;
}`)
</script>

<template>
  <Story>
    <CodeEditor v-model="code" />
  </Story>
</template>
