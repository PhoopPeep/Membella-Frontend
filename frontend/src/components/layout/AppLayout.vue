<template>
  <div>
    <div>
      <div class="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main class="flex-1 overflow-hidden">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>