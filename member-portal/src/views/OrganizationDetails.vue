<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
    <!-- Hero Header -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500"
    >
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-7xl mx-auto">
          <div class="text-center">
            <div
              class="w-24 h-24 bg-white/90 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <img
                v-if="organization?.logo"
                :src="organization.logo"
                :alt="organization.orgName"
                class="w-24 h-24 rounded-3xl object-cover"
                @error="handleImageError"
              />
              <span v-else class="text-primary-600 font-bold text-3xl">
                {{ organization?.orgName?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <h1 class="text-4xl font-bold text-white mb-4">{{ organization?.orgName }}</h1>
            <div class="flex flex-wrap justify-center gap-4">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-primary-700 mb-2">Organization Details</h2>
        <p class="text-lg text-primary-600">
          Learn more about this organization and their available plans
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="relative">
          <div
            class="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin mx-auto mb-6"
          ></div>
          <div
            class="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full animate-spin mx-auto"
          ></div>
        </div>
        <h3 class="text-2xl font-bold text-primary-700 mb-3">Loading Organization</h3>
        <p class="text-primary-600">Please wait while we fetch organization details</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-error-50 border border-error-200 rounded-2xl p-8 text-center"
      >
        <div
          class="w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-2xl font-bold text-error-800 mb-3">Error Loading Organization</h3>
        <p class="text-error-600 mb-6">{{ error }}</p>
        <button
          @click="loadOrganization"
          class="bg-gradient-to-r from-error-500 to-error-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg"
        >
          <FontAwesomeIcon icon="refresh" class="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>

      <!-- Organization Content -->
      <div v-else-if="organization" class="space-y-8">
        <!-- Organization Information -->
        <div class="bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden">
          <div
            class="bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 border-b border-primary-100"
          >
            <h3 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="building" class="w-6 h-6 mr-3 text-secondary-500" />
              Organization Information
            </h3>
          </div>
          <div class="p-8">
            <!-- Organization Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <!-- Total Plans Card -->
              <div
                class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-primary-600 mb-1">Total Plans</p>
                    <p class="text-3xl font-bold text-primary-700">{{ plans.length }}</p>
                  </div>
                  <div
                    class="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon="layer-group" class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <!-- Total Features Card -->
              <div
                class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 border border-secondary-200"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-secondary-600 mb-1">Total Features</p>
                    <p class="text-3xl font-bold text-secondary-700">{{ totalFeatures }}</p>
                  </div>
                  <div
                    class="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon="star" class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <!-- Price Range Card -->
              <div
                class="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-success-600 mb-1">Price Range</p>
                    <p class="text-3xl font-bold text-success-700">฿{{ priceRange }}</p>
                  </div>
                  <div
                    class="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon="dollar-sign" class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Organization Details -->
            <div class="space-y-8">
              <!-- Description Section -->
              <div v-if="organization.description">
                <div
                  class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200"
                >
                  <div class="flex items-start space-x-4">
                    <div
                      class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <FontAwesomeIcon icon="align-left" class="w-6 h-6 text-primary-600" />
                    </div>
                    <div class="flex-1">
                      <h4 class="text-xl font-bold text-primary-700 mb-3">
                        About This Organization
                      </h4>
                      <p class="text-neutral-700 leading-relaxed text-lg">
                        {{ organization.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div
                v-if="organization.contactInfo"
                class="bg-gradient-to-r from-success-50/50 to-success-100/30 rounded-2xl p-6 border border-success-200"
              >
                <div class="flex items-start space-x-4">
                  <div
                    class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <FontAwesomeIcon icon="phone" class="w-6 h-6 text-success-600" />
                  </div>
                  <div class="flex-1">
                    <h4 class="text-xl font-bold text-primary-700 mb-6">Contact Information</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div v-if="parsedContactInfo.phone" class="flex items-center space-x-3">
                        <FontAwesomeIcon icon="phone" class="w-5 h-5 text-success-600" />
                        <div>
                          <p class="text-neutral-700 font-semibold text-lg">
                            {{ parsedContactInfo.phone }}
                          </p>
                          <p class="text-sm text-success-600">Phone Number</p>
                        </div>
                      </div>
                      <div v-if="parsedContactInfo.address" class="flex items-start space-x-3">
                        <FontAwesomeIcon
                          icon="map-marker-alt"
                          class="w-5 h-5 text-success-600 mt-1"
                        />
                        <div>
                          <p class="text-neutral-700 font-semibold text-lg">
                            {{ parsedContactInfo.address }}
                          </p>
                          <p class="text-sm text-success-600">Address</p>
                        </div>
                      </div>
                      <div v-if="parsedContactInfo.website" class="flex items-center space-x-3">
                        <FontAwesomeIcon icon="globe" class="w-5 h-5 text-success-600" />
                        <div>
                          <a
                            :href="
                              parsedContactInfo.website.startsWith('http')
                                ? parsedContactInfo.website
                                : `https://${parsedContactInfo.website}`
                            "
                            target="_blank"
                            class="text-primary-600 hover:text-primary-700 font-semibold text-lg underline"
                          >
                            {{ parsedContactInfo.website }}
                          </a>
                          <p class="text-sm text-success-600">Website</p>
                        </div>
                      </div>
                      <div v-if="parsedContactInfo.email" class="flex items-center space-x-3">
                        <FontAwesomeIcon icon="envelope" class="w-5 h-5 text-success-600" />
                        <div>
                          <a
                            :href="`mailto:${parsedContactInfo.email}`"
                            class="text-primary-600 hover:text-primary-700 font-semibold text-lg"
                          >
                            {{ parsedContactInfo.email }}
                          </a>
                          <p class="text-sm text-success-600">Email</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email Information -->
              <div
                class="bg-gradient-to-r from-primary-50/50 to-primary-100/30 rounded-2xl p-6 border border-primary-200"
              >
                <div class="flex items-center space-x-4">
                  <div
                    class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon="envelope" class="w-6 h-6 text-primary-600" />
                  </div>
                  <div class="flex-1">
                    <h4 class="text-xl font-bold text-primary-700 mb-2">Email Address</h4>
                    <p class="text-neutral-700 font-semibold text-xl">{{ organization.email }}</p>
                    <p class="text-sm text-primary-600 mt-1">Primary Contact</p>
                  </div>
                </div>
              </div>

              <!-- Member Since -->
              <div
                class="bg-gradient-to-r from-secondary-50/50 to-secondary-100/30 rounded-2xl p-6 border border-secondary-200"
              >
                <div class="flex items-center space-x-4">
                  <div
                    class="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon="calendar" class="w-6 h-6 text-secondary-600" />
                  </div>
                  <div class="flex-1">
                    <h4 class="text-xl font-bold text-primary-700 mb-2">Member Since</h4>
                    <p class="text-neutral-700 font-semibold text-xl">
                      {{ formatDate(organization.createdAt) }}
                    </p>
                    <p class="text-sm text-secondary-600 mt-1">Registration Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Plans -->
        <div class="bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden">
          <div
            class="bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 border-b border-primary-100"
          >
            <h3 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="layer-group" class="w-6 h-6 mr-3 text-secondary-500" />
              Available Plans
            </h3>
          </div>
          <div class="p-8">
            <!-- Loading Plans -->
            <div v-if="loadingPlans" class="text-center py-12">
              <div class="relative">
                <div
                  class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin mx-auto mb-4"
                ></div>
                <div
                  class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin mx-auto"
                ></div>
              </div>
              <h4 class="text-lg font-bold text-primary-700 mb-2">Loading Plans</h4>
              <p class="text-primary-600">Please wait while we fetch available plans</p>
            </div>

            <!-- Error Loading Plans -->
            <div
              v-else-if="plansError"
              class="bg-error-50 border border-error-200 rounded-2xl p-6 text-center"
            >
              <div
                class="w-12 h-12 bg-gradient-to-r from-error-500 to-error-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <FontAwesomeIcon icon="exclamation-triangle" class="w-6 h-6 text-white" />
              </div>
              <h4 class="text-lg font-bold text-error-800 mb-2">Error Loading Plans</h4>
              <p class="text-error-600 mb-4">{{ plansError }}</p>
              <button
                @click="loadPlans"
                class="bg-gradient-to-r from-error-500 to-error-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg"
              >
                <FontAwesomeIcon icon="refresh" class="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>

            <!-- Plans Table -->
            <div v-else-if="plans && plans.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-primary-200">
                <thead class="bg-gradient-to-r from-primary-50 to-secondary-50">
                  <tr>
                    <th
                      class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                    >
                      Plan Name
                    </th>
                    <th
                      class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      class="px-8 py-6 text-center text-sm font-bold text-primary-700 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      class="px-8 py-6 text-center text-sm font-bold text-primary-700 uppercase tracking-wider"
                    >
                      Duration
                    </th>
                    <th
                      class="px-8 py-6 text-center text-sm font-bold text-primary-700 uppercase tracking-wider"
                    >
                      Features
                    </th>
                    <th
                      class="px-8 py-6 text-center text-sm font-bold text-primary-700 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-primary-200">
                  <tr
                    v-for="plan in plans"
                    :key="plan.id"
                    class="hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer"
                    @click="viewPlanDetails(plan)"
                  >
                    <!-- Plan Name -->
                    <td class="px-8 py-6 whitespace-nowrap">
                      <div class="flex items-center space-x-4">
                        <div
                          class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0"
                        >
                          <FontAwesomeIcon icon="layer-group" class="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div class="text-lg font-bold text-primary-700">{{ plan.name }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Description -->
                    <td class="px-8 py-6">
                      <div class="max-w-sm">
                        <p class="text-neutral-700 line-clamp-2" :title="plan.description">
                          {{ plan.description || 'No description available for this plan.' }}
                        </p>
                      </div>
                    </td>

                    <!-- Price -->
                    <td class="px-8 py-6 whitespace-nowrap text-center">
                      <div class="text-2xl font-bold text-primary-600">฿{{ plan.price }}</div>
                    </td>

                    <!-- Duration -->
                    <td class="px-8 py-6 whitespace-nowrap text-center">
                      <div class="text-lg font-semibold text-primary-700">{{ plan.duration }}</div>
                      <div class="text-sm text-neutral-500">days</div>
                    </td>

                    <!-- Features Count -->
                    <td class="px-8 py-6 whitespace-nowrap text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <FontAwesomeIcon icon="star" class="w-4 h-4 text-secondary-500" />
                        <span class="text-sm font-semibold text-neutral-700">{{
                          plan.features?.length || 0
                        }}</span>
                      </div>
                    </td>

                    <!-- Actions -->
                    <td class="px-8 py-6 whitespace-nowrap text-center">
                      <div class="flex items-center justify-center space-x-3">
                        <button
                          @click.stop="viewPlanDetails(plan)"
                          class="px-4 py-2 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-lg font-semibold transition-colors duration-200"
                        >
                          View Details
                        </button>
                        <button
                          @click.stop="subscribeToPlan(plan)"
                          :disabled="subscribing === plan.id"
                          class="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-lg"
                        >
                          <div v-if="subscribing === plan.id" class="flex items-center">
                            <div
                              class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                            ></div>
                            Processing...
                          </div>
                          <span v-else class="flex items-center">
                            <FontAwesomeIcon icon="credit-card" class="w-4 h-4 mr-2" />
                            {{ authStore.isAuthenticated ? 'Subscribe' : 'Sign In' }}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- No Plans -->
            <div
              v-else
              class="text-center py-12 bg-primary-50 rounded-2xl border-2 border-primary-200"
            >
              <div
                class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <FontAwesomeIcon icon="inbox" class="w-8 h-8 text-white" />
              </div>
              <h4 class="text-xl font-bold text-primary-700 mb-2">No Plans Available</h4>
              <p class="text-primary-600">
                This organization doesn't have any plans available at the moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Details Modal -->
    <div
      v-if="showPlanModal && selectedPlan"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      @click.self="closePlanModal"
    >
      <div
        class="relative top-20 mx-auto p-8 border w-11/12 max-w-4xl shadow-2xl rounded-2xl bg-white"
      >
        <!-- Modal Header -->
        <div
          class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-t-2xl"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <div
                class="w-16 h-16 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <FontAwesomeIcon icon="layer-group" class="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 class="text-3xl font-bold text-white mb-2">{{ selectedPlan.name }}</h2>
                <p class="text-white/90 text-lg">{{ organization?.orgName }}</p>
              </div>
            </div>
            <button
              @click="closePlanModal"
              class="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <FontAwesomeIcon icon="times" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-8">
          <!-- Plan Overview -->
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-primary-700 mb-6 flex items-center">
              <FontAwesomeIcon icon="info-circle" class="w-6 h-6 mr-3 text-secondary-500" />
              Plan Overview
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Price Card -->
              <div
                class="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200 shadow-soft"
              >
                <div class="text-center">
                  <div
                    class="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <FontAwesomeIcon icon="dollar-sign" class="w-8 h-8 text-white" />
                  </div>
                  <h4 class="text-lg font-bold text-primary-700 mb-2">Price</h4>
                  <div class="text-3xl font-bold text-success-600 mb-1">
                    ฿{{ selectedPlan.price }}
                  </div>
                  <p class="text-sm text-success-600 font-semibold">
                    {{ selectedPlan.duration }} days
                  </p>
                </div>
              </div>

              <!-- Duration Card -->
              <div
                class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200 shadow-soft"
              >
                <div class="text-center">
                  <div
                    class="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <FontAwesomeIcon icon="clock" class="w-8 h-8 text-white" />
                  </div>
                  <h4 class="text-lg font-bold text-primary-700 mb-2">Duration</h4>
                  <div class="text-3xl font-bold text-primary-600 mb-1">
                    {{ selectedPlan.duration }}
                  </div>
                  <p class="text-sm text-primary-600 font-semibold">days</p>
                </div>
              </div>

              <!-- Features Card -->
              <div
                class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 border border-secondary-200 shadow-soft"
              >
                <div class="text-center">
                  <div
                    class="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <FontAwesomeIcon icon="star" class="w-8 h-8 text-white" />
                  </div>
                  <h4 class="text-lg font-bold text-primary-700 mb-2">Features</h4>
                  <div class="text-3xl font-bold text-secondary-600 mb-1">
                    {{ selectedPlan.features?.length || 0 }}
                  </div>
                  <p class="text-sm text-secondary-600 font-semibold">included</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-primary-700 mb-6 flex items-center">
              <FontAwesomeIcon icon="align-left" class="w-6 h-6 mr-3 text-secondary-500" />
              Description
            </h3>
            <div
              class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200"
            >
              <p class="text-neutral-700 leading-relaxed text-lg">
                {{ selectedPlan.description || 'No description available for this plan.' }}
              </p>
            </div>
          </div>

          <!-- Features List -->
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-primary-700 mb-6 flex items-center">
              <FontAwesomeIcon icon="star" class="w-6 h-6 mr-3 text-secondary-500" />
              Features Included
            </h3>
            <div
              v-if="selectedPlan.features && selectedPlan.features.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div
                v-for="feature in selectedPlan.features"
                :key="feature.id"
                class="flex items-start space-x-4 p-6 bg-gradient-to-r from-success-50/50 to-success-100/50 rounded-2xl border border-success-200 hover:shadow-soft transition-all duration-200"
              >
                <div class="flex-shrink-0">
                  <div
                    class="w-10 h-10 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon="check" class="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 class="font-bold text-primary-700 mb-2">{{ feature.name }}</h4>
                  <p class="text-neutral-700 leading-relaxed">{{ feature.description }}</p>
                </div>
              </div>
            </div>
            <div
              v-else
              class="text-center py-12 bg-primary-50 rounded-2xl border-2 border-primary-200"
            >
              <div
                class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <FontAwesomeIcon icon="inbox" class="w-8 h-8 text-white" />
              </div>
              <h4 class="text-lg font-bold text-primary-700 mb-2">No Features Listed</h4>
              <p class="text-primary-600">This plan doesn't have any specific features listed.</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-primary-100">
            <button
              @click="closePlanModal"
              class="px-8 py-3 text-primary-600 bg-white border-2 border-primary-200 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
            >
              Close
            </button>
            <button
              @click="subscribeToPlan(selectedPlan)"
              :disabled="subscribing === selectedPlan.id"
              class="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center"
            >
              <div v-if="subscribing === selectedPlan.id" class="flex items-center">
                <div
                  class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                ></div>
                Processing...
              </div>
              <span v-else class="flex items-center">
                <FontAwesomeIcon icon="credit-card" class="w-5 h-5 mr-2" />
                {{ authStore.isAuthenticated ? 'Subscribe Now' : 'Sign In to Subscribe' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAuthStore } from '../stores/auth'
import { memberApi } from '../api/member'
// Payment API will be used in the future for actual payment processing

// Types
interface Organization {
  id: string
  orgName: string
  email: string
  description?: string
  contactInfo?: string
  logo?: string
  createdAt: string
  plans?: Plan[]
}

interface Plan {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  features?: Feature[]
  organization: string
  organizationEmail?: string
  organizationContact?: string
}

interface Feature {
  id: string
  name: string
  description: string
}

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const organization = ref<Organization | null>(null)
const plans = ref<Plan[]>([])
const loading = ref(true)
const loadingPlans = ref(false)
const error = ref<string | null>(null)
const plansError = ref<string | null>(null)
const showPlanModal = ref(false)
const selectedPlan = ref<Plan | null>(null)
const subscribing = ref<string | null>(null)

// Computed
const organizationId = computed(() => route.params.id as string)

const totalFeatures = computed(() => {
  return plans.value.reduce((total, plan) => total + (plan.features?.length || 0), 0)
})

const priceRange = computed(() => {
  if (plans.value.length === 0) return '0 - 0'

  const prices = plans.value.map((plan) => plan.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (minPrice === maxPrice) {
    return minPrice.toString()
  }

  return `${minPrice} - ${maxPrice}`
})

const parsedContactInfo = computed(() => {
  if (!organization.value?.contactInfo) {
    return {}
  }

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(organization.value.contactInfo)
    return {
      phone: parsed.phone || '',
      address: parsed.address || '',
      website: parsed.website || '',
      email: parsed.email || '',
    }
  } catch {
    // If not JSON, treat as plain text
    return {
      phone: organization.value.contactInfo,
      address: '',
      website: '',
      email: '',
    }
  }
})

// Methods
const loadOrganization = async () => {
  try {
    loading.value = true
    error.value = null

    // Get all owners first to find the specific organization
    const owners = await memberApi.getOwners()
    const foundOwner = owners.find((owner) => owner.id === organizationId.value)

    if (!foundOwner) {
      throw new Error('Organization not found')
    }

    // Transform owner data to organization format
    organization.value = {
      id: foundOwner.id,
      orgName: foundOwner.orgName,
      email: foundOwner.email,
      description: foundOwner.description,
      contactInfo: foundOwner.contactInfo,
      logo: foundOwner.logo,
      createdAt: foundOwner.createdAt,
      plans: [],
    }

    await loadPlans()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load organization'
  } finally {
    loading.value = false
  }
}

const loadPlans = async () => {
  if (!organization.value) return

  try {
    loadingPlans.value = true
    plansError.value = null

    // Use the actual API to get owner plans
    const ownerPlans = await memberApi.getOwnerPlans(organizationId.value)

    // Transform plans data to match our interface
    plans.value = ownerPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      organization: organization.value?.orgName || '',
      organizationEmail: organization.value?.email,
      organizationContact: organization.value?.contactInfo,
    }))
  } catch (err) {
    plansError.value = err instanceof Error ? err.message : 'Failed to load plans'
  } finally {
    loadingPlans.value = false
  }
}

const viewPlanDetails = (plan: Plan) => {
  selectedPlan.value = plan
  showPlanModal.value = true
}

const closePlanModal = () => {
  showPlanModal.value = false
  selectedPlan.value = null
}

const subscribeToPlan = async (plan: Plan) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    subscribing.value = plan.id

    // Redirect to payment page with plan information
    router.push({
      name: 'payment',
      query: {
        planId: plan.id,
        planName: plan.name,
        price: plan.price.toString(),
        duration: plan.duration.toString(),
        organization: plan.organization,
        organizationId: organizationId.value
      }
    })

    closePlanModal()
  } catch (err) {
    console.error('Failed to initiate subscription:', err)
    alert(err instanceof Error ? err.message : 'Failed to subscribe to plan')
  } finally {
    subscribing.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Lifecycle
onMounted(() => {
  loadOrganization()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
