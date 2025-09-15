<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
    <!-- Hero Header Section -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-16 md:px-8"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-secondary-400/20 rounded-full -translate-y-32 translate-x-32"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 rounded-full translate-y-24 -translate-x-24"
      ></div>

      <div class="relative max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
          My Subscriptions 📋
        </h1>
        <p class="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          Manage your active subscriptions and view your history
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-12">
      <!-- Page Header -->
      <div class="mb-8 mt-8">
        <div class="text-center">
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin mx-auto mb-6"></div>
          <div class="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        </div>
        <h3 class="text-2xl font-bold text-primary-700 mb-3">Loading Subscriptions</h3>
        <p class="text-primary-600">Please wait while we fetch your subscription data</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-error-50 border border-error-200 rounded-2xl p-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-2xl font-bold text-error-800 mb-3">Error Loading Subscriptions</h3>
        <p class="text-error-600 mb-6">{{ error }}</p>
        <button
          @click="loadSubscriptions"
          class="bg-gradient-to-r from-error-500 to-error-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg"
        >
          <FontAwesomeIcon icon="refresh" class="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- Stats Cards -->
        <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200 shadow-soft">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-primary-600 mb-1">Total Subscriptions</p>
                <p class="text-3xl font-bold text-primary-700">{{ stats.totalSubscriptions }}</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon="layer-group" class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200 shadow-soft">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-success-600 mb-1">Active Plans</p>
                <p class="text-3xl font-bold text-success-700">{{ stats.activeSubscriptions }}</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon="check-circle" class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-warning-50 to-warning-100 rounded-2xl p-6 border border-warning-200 shadow-soft">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-warning-600 mb-1">Expired Plans</p>
                <p class="text-3xl font-bold text-warning-700">{{ stats.expiredSubscriptions }}</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon="clock" class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 border border-secondary-200 shadow-soft">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-secondary-600 mb-1">Total Spent</p>
                <p class="text-3xl font-bold text-secondary-700">฿{{ stats.totalSpent.toLocaleString() }}</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon="money-bill" class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Active Subscriptions -->
        <div
          v-if="activeSubscriptions.length > 0"
          class="bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 border-b border-primary-100">
            <h2 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="check-circle" class="w-6 h-6 mr-3 text-success-500" />
              Active Subscriptions
            </h2>
          </div>
          <div class="space-y-6">
            <div
              v-for="subscription in activeSubscriptions"
              :key="subscription.id"
              class="bg-gradient-to-br from-white to-primary-50/20 rounded-2xl border border-primary-200 shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <!-- Card Header -->
              <div class="bg-gradient-to-r from-success-500 to-success-600 px-8 py-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon="layer-group" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-white">{{ subscription.planName }}</h3>
                      <p class="text-success-100 text-base">{{ subscription.organization }}</p>
                    </div>
                  </div>
                  <span class="px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-xl">
                    Active
                  </span>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-8">
                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="dollar-sign" class="w-5 h-5 text-primary-600" />
                      <p class="text-sm font-semibold text-primary-600">Price</p>
                    </div>
                    <p class="text-3xl font-bold text-primary-700">
                      ฿{{ subscription.price.toLocaleString() }}
                    </p>
                  </div>
                  <div class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-5 border border-secondary-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="clock" class="w-5 h-5 text-secondary-600" />
                      <p class="text-sm font-semibold text-secondary-600">Duration</p>
                    </div>
                    <p class="text-3xl font-bold text-secondary-700">{{ subscription.duration }} days</p>
                  </div>
                  <div class="bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl p-5 border border-warning-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="calendar" class="w-5 h-5 text-warning-600" />
                      <p class="text-sm font-semibold text-warning-600">Days Left</p>
                    </div>
                    <p
                      class="text-3xl font-bold"
                      :class="subscription.daysRemaining <= 7 ? 'text-error-600' : 'text-warning-700'"
                    >
                      {{ subscription.daysRemaining }}
                    </p>
                  </div>
                  <div class="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-5 border border-success-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="calendar-check" class="w-5 h-5 text-success-600" />
                      <p class="text-sm font-semibold text-success-600">End Date</p>
                    </div>
                    <p class="text-lg font-bold text-success-700">
                      {{ formatDate(subscription.endDate) }}
                    </p>
                  </div>
                </div>

                <!-- Features Section -->
                <div v-if="subscription.features.length > 0" class="mb-8">
                  <div class="flex items-center space-x-3 mb-4">
                    <FontAwesomeIcon icon="star" class="w-5 h-5 text-secondary-600" />
                    <p class="text-lg font-semibold text-primary-600">Included Features</p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <span
                      v-for="feature in subscription.features.slice(0, 6)"
                      :key="feature.id"
                      class="px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-sm font-semibold rounded-lg border border-primary-200"
                    >
                      {{ feature.name }}
                    </span>
                    <span
                      v-if="subscription.features.length > 6"
                      class="px-4 py-2 bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-600 text-sm font-semibold rounded-lg border border-neutral-300"
                    >
                      +{{ subscription.features.length - 6 }} more
                    </span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-4">
                  <button
                    @click="viewSubscriptionDetails(subscription)"
                    class="px-8 py-4 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200 flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon="eye" class="w-5 h-5" />
                    <span>View Details</span>
                  </button>
                  <button
                    @click="confirmCancelSubscription(subscription)"
                    class="px-8 py-4 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon="times" class="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expired/Cancelled Subscriptions -->
        <div
          v-if="inactiveSubscriptions.length > 0"
          class="bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 border-b border-primary-100">
            <h2 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="history" class="w-6 h-6 mr-3 text-warning-500" />
              Subscription History
            </h2>
          </div>
          <div class="space-y-6 p-6">
            <div
              v-for="subscription in inactiveSubscriptions"
              :key="subscription.id"
              class="bg-gradient-to-br from-white to-neutral-50/20 rounded-2xl border border-neutral-200 shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <!-- Card Header -->
              <div
                :class="[
                  'px-8 py-6',
                  subscription.status === 'expired'
                    ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                    : 'bg-gradient-to-r from-neutral-500 to-neutral-600'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon="layer-group" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-white">{{ subscription.planName }}</h3>
                      <p class="text-white/80 text-base">{{ subscription.organization }}</p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-xl',
                      subscription.status === 'expired' ? 'text-warning-100' : 'text-neutral-100'
                    ]"
                  >
                    {{
                      subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
                    }}
                  </span>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-8">
                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="dollar-sign" class="w-5 h-5 text-primary-600" />
                      <p class="text-sm font-semibold text-primary-600">Price</p>
                    </div>
                    <p class="text-3xl font-bold text-primary-700">
                      ฿{{ subscription.price.toLocaleString() }}
                    </p>
                  </div>
                  <div class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-5 border border-secondary-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="clock" class="w-5 h-5 text-secondary-600" />
                      <p class="text-sm font-semibold text-secondary-600">Duration</p>
                    </div>
                    <p class="text-3xl font-bold text-secondary-700">{{ subscription.duration }} days</p>
                  </div>
                  <div class="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-5 border border-success-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="calendar-plus" class="w-5 h-5 text-success-600" />
                      <p class="text-sm font-semibold text-success-600">Start Date</p>
                    </div>
                    <p class="text-lg font-bold text-success-700">
                      {{ formatDate(subscription.startDate) }}
                    </p>
                  </div>
                  <div class="bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl p-5 border border-warning-200">
                    <div class="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon icon="calendar-times" class="w-5 h-5 text-warning-600" />
                      <p class="text-sm font-semibold text-warning-600">End Date</p>
                    </div>
                    <p class="text-lg font-bold text-warning-700">
                      {{ formatDate(subscription.endDate) }}
                    </p>
                  </div>
                </div>

                <!-- Action Button -->
                <div class="flex justify-center">
                  <button
                    @click="viewSubscriptionDetails(subscription)"
                    class="px-8 py-4 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200 flex items-center space-x-3"
                  >
                    <FontAwesomeIcon icon="eye" class="w-5 h-5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Subscriptions -->
        <div
          v-if="subscriptions.length === 0"
          class="text-center py-16 bg-white rounded-2xl shadow-soft border border-primary-100"
        >
          <div class="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="layer-group" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-primary-700 mb-3">No Subscriptions Yet</h3>
          <p class="text-primary-600 mb-8 text-lg">You haven't subscribed to any plans yet. Start exploring available organizations and their plans!</p>
          <router-link
            to="/homepage"
            class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg inline-flex items-center"
          >
            <FontAwesomeIcon icon="search" class="w-5 h-5 mr-3" />
            Browse Organizations
          </router-link>
        </div>
      </div>

      <!-- Subscription Details Modal -->
      <div
        v-if="showDetailsModal && selectedSubscription"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        @click.self="closeDetailsModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative top-20 mx-auto">
          <div class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-white">Subscription Details</h2>
              <button
                @click="closeDetailsModal"
                class="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-xl"
              >
                <FontAwesomeIcon icon="times" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="p-8 space-y-8">
            <!-- Plan Info -->
            <div>
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="layer-group" class="w-5 h-5 mr-2 text-secondary-500" />
                Plan Information
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="tag" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Plan Name</span>
                    </div>
                    <span class="text-lg font-bold text-primary-700">{{ selectedSubscription.planName }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="building" class="w-4 h-4 text-secondary-600" />
                      <span class="text-sm font-semibold text-secondary-600">Organization</span>
                    </div>
                    <span class="text-lg font-bold text-secondary-700">{{ selectedSubscription.organization }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="dollar-sign" class="w-4 h-4 text-success-600" />
                      <span class="text-sm font-semibold text-success-600">Price</span>
                    </div>
                    <span class="text-lg font-bold text-success-700">฿{{ selectedSubscription.price.toLocaleString() }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="clock" class="w-4 h-4 text-warning-600" />
                      <span class="text-sm font-semibold text-warning-600">Duration</span>
                    </div>
                    <span class="text-lg font-bold text-warning-700">{{ selectedSubscription.duration }} days</span>
                  </div>
                </div>
                <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <FontAwesomeIcon icon="info-circle" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Status</span>
                    </div>
                    <span
                      :class="[
                        'px-4 py-2 rounded-xl text-sm font-bold',
                        selectedSubscription.status === 'active'
                          ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border border-success-300'
                          : selectedSubscription.status === 'expired'
                          ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border border-warning-300'
                          : 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-300',
                      ]"
                    >
                      {{
                        selectedSubscription.status.charAt(0).toUpperCase() +
                        selectedSubscription.status.slice(1)
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subscription Period -->
            <div>
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="calendar-alt" class="w-5 h-5 mr-2 text-secondary-500" />
                Subscription Period
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="calendar-plus" class="w-4 h-4 text-success-600" />
                      <span class="text-sm font-semibold text-success-600">Start Date</span>
                    </div>
                    <span class="text-lg font-bold text-success-700">{{ formatDate(selectedSubscription.startDate) }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="calendar-times" class="w-4 h-4 text-warning-600" />
                      <span class="text-sm font-semibold text-warning-600">End Date</span>
                    </div>
                    <span class="text-lg font-bold text-warning-700">{{ formatDate(selectedSubscription.endDate) }}</span>
                  </div>
                  <div v-if="selectedSubscription.isActive" class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="clock" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Days Remaining</span>
                    </div>
                    <span
                      :class="[
                        'text-lg font-bold',
                        selectedSubscription.daysRemaining <= 7 ? 'text-error-600' : 'text-primary-700',
                      ]"
                    >
                      {{ selectedSubscription.daysRemaining }} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div v-if="selectedSubscription.features.length > 0">
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="star" class="w-5 h-5 mr-2 text-secondary-500" />
                Included Features
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="feature in selectedSubscription.features"
                    :key="feature.id"
                    class="flex items-start space-x-3 p-4 bg-white/50 rounded-xl border border-primary-200"
                  >
                    <div class="w-8 h-8 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon
                        icon="check"
                        class="w-4 h-4 text-white"
                      />
                    </div>
                    <div>
                      <p class="font-bold text-primary-700 text-lg">{{ feature.name }}</p>
                      <p class="text-sm text-primary-600">{{ feature.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div>
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="credit-card" class="w-5 h-5 mr-2 text-secondary-500" />
                Payment Information
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="dollar-sign" class="w-4 h-4 text-success-600" />
                      <span class="text-sm font-semibold text-success-600">Amount Paid</span>
                    </div>
                    <span class="text-lg font-bold text-success-700">฿{{ selectedSubscription.payment.amount.toLocaleString() }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="credit-card" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Payment Method</span>
                    </div>
                    <span class="text-lg font-bold text-primary-700 capitalize">{{ selectedSubscription.payment.method }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="calendar-check" class="w-4 h-4 text-secondary-600" />
                      <span class="text-sm font-semibold text-secondary-600">Payment Date</span>
                    </div>
                    <span class="text-lg font-bold text-secondary-700">{{ formatDate(selectedSubscription.payment.paidAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Confirmation Modal -->
      <div
        v-if="showCancelModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full relative top-20 mx-auto">
          <div class="p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-2xl font-bold text-primary-700 mb-3">Cancel Subscription</h3>
              <p class="text-primary-600 text-lg">
                Are you sure you want to cancel your subscription to
                <strong class="text-primary-700">{{ subscriptionToCancel?.planName }}</strong>?
                This action cannot be undone and you will lose access to all features immediately.
              </p>
            </div>

            <div class="flex space-x-4">
              <button
                @click="closeCancelModal"
                :disabled="isCancelling"
                class="flex-1 px-6 py-3 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200 disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                @click="cancelSubscription"
                :disabled="isCancelling"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                <div v-if="isCancelling" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Cancelling...
                </div>
                <span v-else>Yes, Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { subscriptionApi, type Subscription, type SubscriptionStats } from '../api/subscription'

// State
const loading = ref(false)
const error = ref('')
const subscriptions = ref<Subscription[]>([])
const stats = ref<SubscriptionStats | null>(null)
const selectedSubscription = ref<Subscription | null>(null)
const subscriptionToCancel = ref<Subscription | null>(null)
const showDetailsModal = ref(false)
const showCancelModal = ref(false)
const isCancelling = ref(false)

// Computed properties
const activeSubscriptions = computed(() => subscriptions.value.filter((sub) => sub.isActive))

const inactiveSubscriptions = computed(() => subscriptions.value.filter((sub) => !sub.isActive))

// Methods
const loadSubscriptions = async () => {
  try {
    loading.value = true
    error.value = ''

    const [subscriptionsData, statsData] = await Promise.all([
      subscriptionApi.getSubscriptions(),
      subscriptionApi.getSubscriptionStats(),
    ])

    subscriptions.value = subscriptionsData
    stats.value = statsData

    console.log('Subscriptions loaded:', subscriptionsData.length)
    console.log('Stats loaded:', statsData)
  } catch (err) {
    console.error('Failed to load subscriptions:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

const viewSubscriptionDetails = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedSubscription.value = null
}

const confirmCancelSubscription = (subscription: Subscription) => {
  subscriptionToCancel.value = subscription
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  subscriptionToCancel.value = null
}

const cancelSubscription = async () => {
  if (!subscriptionToCancel.value) return

  try {
    isCancelling.value = true

    await subscriptionApi.cancelSubscription(subscriptionToCancel.value.id)

    // Update local state
    const index = subscriptions.value.findIndex((sub) => sub.id === subscriptionToCancel.value!.id)
    if (index !== -1) {
      subscriptions.value[index].status = 'cancelled'
      subscriptions.value[index].isActive = false
    }

    // Refresh stats
    stats.value = await subscriptionApi.getSubscriptionStats()

    closeCancelModal()
  } catch (err) {
    console.error('Failed to cancel subscription:', err)
    error.value = err instanceof Error ? err.message : 'Failed to cancel subscription'
  } finally {
    isCancelling.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadSubscriptions()
})
</script>
