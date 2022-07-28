<script setup lang="ts">
import BiHouse from '~icons/bi/house'
import File from '~icons/bi/file-text'
import Trophy from '~icons/bi/trophy'
import User from '~icons/fa6-regular/user'
import Brain from '~icons/fluent/brain-circuit-24-regular'
import Box from '~icons/bi/box'
import Code from '~icons/bi/code-square'
import Book from '~icons/bi/journals'
</script>

<template>
  <div
    class="bg-gray-light fixed top-0 bottom-0 left-0 h-full w-[200px] overflow-auto"
  >
    <div class="align-center flex justify-center">
      <img src="@/../codingPlatformLogo.png" class="m-6 h-[77px] w-[155px]" />
    </div>
    <div class="text-gray-dark">
      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/"
      >
        <BiHouse class="mr-2" />
        SKKUDING
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/notice"
      >
        <File class="mr-2" />
        Notice
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/contest"
      >
        <Trophy class="mr-2" />
        Contest
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/workbook"
      >
        <Book class="mr-2" />
        Workbook
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/problem"
      >
        <Brain class="mr-2" />
        Problem
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/"
      >
        <Box class="mr-2" />
        Problem Pool
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/"
      >
        <User class="mr-2" />
        Member
      </router-link>

      <router-link
        class="border-gray flex border-y border-opacity-25 p-2 pl-10 font-bold"
        to="/"
      >
        <Code class="mr-2" />
        Submission
      </router-link>
    </div>
  </div>
</template>
