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

const javaCode = ref(`class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`)

const goCode = ref(`package main
import "fmt"

func main() {
    fmt.Println("Hello, world!")
}
`)
</script>

<template>
  <Story>
    <Variant title="C/C++">
      <CodeEditor v-model="cppCode" lang="Cpp" />
    </Variant>
    <Variant title="Python">
      <CodeEditor v-model="pythonCode" lang="Python3" />
    </Variant>
    <Variant title="Java">
      <CodeEditor v-model="javaCode" lang="Java" />
    </Variant>
    <Variant title="Go">
      <CodeEditor v-model="goCode" lang="Golang" />
    </Variant>
  </Story>
</template>
