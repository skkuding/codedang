<script setup lang="ts">
import Footer from '@/common/components/Organism/Footer.vue'
import Header from '@/common/components/Organism/Header.vue'
import Card from '../components/Card.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Button from '@/common/components/Atom/Button.vue'
import Carousel from '../components/Carousel.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import { ref } from 'vue'
import IconInfo from '~icons/fa6-solid/circle-info'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconMedal from '~icons/fa6-solid/medal'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconCalendar from '~icons/fa6-solid/calendar'
import MajesticonsSend from '~icons/majesticons/send'
import Fa6SolidCheck from '~icons/fa6-solid/check'
const noticeItems = [
  {
    title: 'SKKU Coding Platform 모의대회 결과 및 솔루션',
    date: 'Jan 9,2021',
    href: '#'
  },
  {
    title: 'SKKU Coding Platform 모의대회 결과',
    date: 'Dec 31,2020',
    href: '#'
  }
]

const contestItems = [
  {
    title: 'SKKU Coding Platform 모의대회',
    date: 'Jan 9,2021',
    href: '#',
    state: 'ongoing'
  },
  {
    title: 'SKKU Coding Platform 1차 대회',
    date: 'Dec 31,2020',
    href: '#',
    state: 'prearranged'
  },
  {
    title: 'SKKU Coding Platform 2차 대회',
    date: 'Dec 31,2020',
    href: '#',
    state: 'prearranged'
  }
]
const slides = [
  'https://picsum.photos/id/1032/900/400',
  'https://picsum.photos/id/1033/900/400',
  'https://picsum.photos/id/1037/900/400',
  'https://picsum.photos/id/1035/900/400',
  'https://picsum.photos/id/1036/900/400'
]

const isSignUpModalVisible = ref(false)
const isLogInModalVisible = ref(false)
const isPasswordFindModalVisible = ref(false)
function close() {
  isSignUpModalVisible.value = false
  isLogInModalVisible.value = false
  isPasswordFindModalVisible.value = false
}
</script>

<template>
  <Header class="fixed top-0 w-full">
    <template #SignUp>
      <Button
        color="gray-dark"
        class="w-20"
        @click="isSignUpModalVisible = true"
      >
        Sign Up
      </Button>
    </template>
    <template #LogIn>
      <Button
        color="gray-dark"
        class="w-16"
        @click="isLogInModalVisible = true"
      >
        Log In
      </Button>
    </template>
  </Header>

  <Modal
    v-if="isSignUpModalVisible"
    title="Welcome to SKKU Coding Platform"
    title-color="green"
    @close="close"
  >
    <template #modal-content>
      <ul class="m-9 p-2">
        <InputItem shadow placeholder="User ID" />
        <InputItem shadow placeholder="Student ID" />
        <InputItem shadow placeholder="Real Name" />
        <InputItem shadow placeholder="PassWord" />
        <InputItem shadow placeholder="PassWord Again" />
        <div class="flex">
          <InputItem
            :notice="false"
            size="small"
            shadow
            placeholder="Email Address"
          />
          <Button color="green">
            <MajesticonsSend />
          </Button>
        </div>

        <div class="flex">
          <InputItem shadow placeholder="Vertification code" />
          <Button color="green">
            <Fa6SolidCheck />
          </Button>
        </div>

        <InputItem shadow placeholder="Captcha" size="small" />
      </ul>
      <Button color="green" class="mt-8">register</Button>
      <p>Already have account?</p>
      <!-- TODO: 아래 border -->
      <button
        class="border-b-1 border-black"
        @click="isLogInModalVisible = true"
      >
        Sign in
      </button>
    </template>
  </Modal>
  <Modal
    v-if="isLogInModalVisible"
    title="Skku coding platform"
    title-color="green"
    @close="close"
  >
    <template #modal-image>
      <img src="@/common/assets/logo.svg" class="w-20" alt="" />
    </template>
    <template #modal-content>
      <ul class="m-9 p-2">
        <InputItem shadow placeholder="User ID" />
        <InputItem shadow placeholder="Password" />
      </ul>
      <!-- TODO: sign in 눌렀을 경우 아이콘으로 바뀌기-->
      <Button color="green" class="mt-8" @click="$emit('isauth', true)">
        Sign In
      </Button>
      <div class="bottom-0 mt-8 flex justify-around">
        <button
          class="border-b-1 border-black"
          @click="isSignUpModalVisible = true"
        >
          Register now
        </button>
        <button
          class="border-b-1 border-black"
          @click="isPasswordFindModalVisible = true"
        >
          Forgot Password?
        </button>
      </div>
    </template>
  </Modal>
  <Modal
    v-if="isPasswordFindModalVisible"
    title="Password Recovery"
    title-color="green"
    @close="close"
  >
    <template #modal-content>
      <ul class="m-9 p-2">
        <div class="flex">
          <InputItem
            :notice="false"
            size="small"
            shadow
            placeholder="Email Address"
          />
          <Button color="green">
            <MajesticonsSend />
          </Button>
        </div>

        <div class="flex">
          <InputItem shadow placeholder="Vertification code" />
          <Button color="green">
            <Fa6SolidCheck />
          </Button>
        </div>
        <InputItem shadow placeholder="Captcha" />
      </ul>

      <Button color="green" class="mt-8">Send Password Reset Email</Button>
      <div>
        <button
          class="border-b-1 border-black"
          @click="isLogInModalVisible = true"
        >
          Back to Sign in
        </button>
      </div>
    </template>
  </Modal>
  <!-- FIXME: relative 속성일 때 가운데 정렬 mx:auto? -->
  <div
    class="inline-flex-col relative mx-auto mt-[56px] w-full lg:flex lg:justify-around"
  >
    <Card href="#" :items="noticeItems" class="max-w-xl">
      <template #title>
        <IconInfo />
        <h2 class="ml-2">Notice</h2>
      </template>

      <template #icon>
        <IconAngleRight />
      </template>
    </Card>
    <Card href="#" :items="contestItems" class="max-w-xl">
      <template #title>
        <IconMedal />
        <h2 class="ml-2">Current/Upcoming Contests</h2>
      </template>

      <template #icon="item">
        <IconEllipsis v-if="item.item === 'ongoing'" />
        <IconCalendar v-else />
      </template>
    </Card>
  </div>
  <Footer class="fixed bottom-0" />
</template>
