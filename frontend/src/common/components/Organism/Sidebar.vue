<template>
  <div class="bg-gray-light h-screen w-[200px]">
    <div class="align-center flex justify-center">
      <img src="@/../codingPlatformLogo.png" class="m-6 h-[77px] w-[155px]" />
    </div>
    <div>
      <div>
        <ul class="text-gray-dark">
          <router-link to="/">
            <li
              class="border-gray flex cursor-pointer border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Home.svg" class="mr-3" />
                <span>SKKUDING</span>
              </div>
            </li>
          </router-link>
          <router-link to="/notice">
            <li
              class="border-gray flex cursor-pointer border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Notice.svg" class="mr-3" />
                <span>Notice</span>
              </div>
            </li>
          </router-link>
          <router-link to="/">
            <li
              class="border-gray flex border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Contest.svg" class="mr-3" />
                <span>Contest</span>
              </div>
            </li>
          </router-link>

          <router-link to="/">
            <li
              class="border-gray flex border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Workbook.svg" class="mr-3" />
                <span>Workbook</span>
              </div>
            </li>
          </router-link>

          <router-link to="/">
            <li
              class="border-gray flex border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Problem.svg" class="mr-3" />
                <span>Problem</span>
              </div>
            </li>
          </router-link>

          <router-link to="/">
            <li
              class="border-gray flex border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Problem Pool.svg" class="mr-3" />
                <span>Problem Pool</span>
              </div>
            </li>
          </router-link>

          <router-link to="/">
            <li
              class="border-gray flex border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-6 flex">
                <img src="@/../Member.svg" class="mr-3" />
                <span>Member</span>
              </div>
            </li>
          </router-link>

          <router-link to="/">
            <li
              class="border-gray flex border-y border-opacity-25 p-2 font-bold"
            >
              <div class="ml-[18px] flex">
                <img src="@/../Submission.svg" class="mr-[9px]" />
                <span>Submission</span>
              </div>
            </li>
          </router-link>
        </ul>
      </div>
    </div>
  </div>
</template>
