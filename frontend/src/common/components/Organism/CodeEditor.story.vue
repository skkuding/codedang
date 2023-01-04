<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from './CodeEditor.vue'

const cppCode = ref(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}
`)

const pythonCode = ref(`print("Hello, world!")
`)

const javascriptCode = ref(`console.log('Hello, world!')
`)

const javaCode = ref(`class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`)
</script>

<template>
  <Story>
    <Variant title="C/C++">
      <CodeEditor v-model="cppCode" lang="cpp" />
    </Variant>
    <Variant title="Python">
      <CodeEditor v-model="pythonCode" lang="python" />
    </Variant>
    <Variant title="Javascript">
      <CodeEditor v-model="javascriptCode" lang="javascript" />
    </Variant>
    <Variant title="Java">
      <CodeEditor v-model="javaCode" lang="java" />
    </Variant>
  </Story>
</template>
