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
          Payment History 💳
        </h1>
        <p class="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          View all your payment transactions and receipts
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-12">
      <!-- Page Header -->
      <div class="mb-8 mt-8">
        <div class="text-center">
        </div>
      </div>

      <!-- Auto-refresh indicator -->
      <div v-if="autoRefreshActive" class="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3">
            <div class="animate-pulse w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span class="text-sm font-semibold text-primary-700"
            >Auto-refresh active - monitoring payment status updates</span
          >
          <button
            @click="toggleAutoRefresh"
            class="ml-auto px-4 py-2 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-lg text-sm font-semibold transition-colors duration-200"
          >
            Stop monitoring
          </button>
        </div>
      </div>

      <!-- Connection status indicator -->
      <div v-if="!isOnline" class="mb-6 bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-2xl p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mr-3">
            <FontAwesomeIcon icon="exclamation-triangle" class="w-4 h-4 text-white" />
          </div>
          <span class="text-sm font-semibold text-warning-700"
            >You're offline. Payment status may not be up to date.</span
          >
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="mb-8 bg-white rounded-2xl shadow-soft border border-primary-100 p-6">
        <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div class="flex flex-col sm:flex-row gap-6">
            <!-- Status Filter -->
            <div>
              <label for="statusFilter" class="block text-sm font-semibold text-primary-700 mb-2">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                v-model="selectedStatus"
                @change="applyFilters"
                class="border border-primary-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <!-- Results per page -->
            <div>
              <label for="limitFilter" class="block text-sm font-semibold text-primary-700 mb-2">
                Results per page
              </label>
              <select
                id="limitFilter"
                v-model="pageLimit"
                @change="applyFilters"
                class="border border-primary-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary-100 focus:border-primary-500 bg-white"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <!-- Refresh -->
          <div class="flex items-center space-x-3">
            <button
              @click="refreshPayments"
              :disabled="loading"
              class="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              <FontAwesomeIcon
                :icon="loading ? 'spinner' : 'sync-alt'"
                :class="{ 'animate-spin': loading }"
                class="w-4 h-4"
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && payments.length === 0" class="text-center py-16">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin mx-auto mb-6"></div>
          <div class="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        </div>
        <h3 class="text-2xl font-bold text-primary-700 mb-3">Loading Payment History</h3>
        <p class="text-primary-600">Please wait while we fetch your payment data</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-error-50 border border-error-200 rounded-2xl p-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-2xl font-bold text-error-800 mb-3">Error Loading Payment History</h3>
        <p class="text-error-600 mb-6">{{ error }}</p>
        <button
          @click="() => loadPaymentHistory()"
          class="bg-gradient-to-r from-error-500 to-error-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg"
        >
          <FontAwesomeIcon icon="refresh" class="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>

      <!-- Payment History Table -->
      <div
        v-else-if="payments.length > 0"
        class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
      >
        <div class="bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 border-b border-primary-100">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-primary-700 flex items-center mb-2">
                <FontAwesomeIcon icon="credit-card" class="w-6 h-6 mr-3 text-secondary-500" />
                Transaction History
              </h2>
              <p class="text-primary-600 font-semibold">
                {{ pagination.total }} transaction{{ pagination.total === 1 ? '' : 's' }} found
                {{ selectedStatus ? `(${selectedStatus} only)` : '' }}
                <span v-if="autoRefreshActive" class="text-primary-500 ml-2">
                  • Auto-updating every {{ autoRefreshInterval / 1000 }}s
                </span>
              </p>
            </div>
            <div class="text-sm text-primary-600 font-semibold">
              Showing {{ pagination.offset + 1 }}-{{
                Math.min(pagination.offset + pageLimit, pagination.total)
              }}
              of {{ pagination.total }}
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-primary-200">
            <thead class="bg-gradient-to-r from-primary-50 to-secondary-50">
              <tr>
                <th
                  class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                >
                  Date & Plan
                </th>
                <th
                  class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                >
                  Organization
                </th>
                <th
                  class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                >
                  Payment Method
                </th>
                <th
                  class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
                >
                  Subscription
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
                v-for="payment in payments"
                :key="payment.id"
                class="hover:bg-primary-50/30 transition-colors duration-200"
                :class="{
                  'bg-blue-50 border-l-4 border-l-blue-400': recentlyUpdatedPayments.includes(
                    payment.id,
                  ),
                }"
              >
                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon="layer-group" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p class="text-lg font-bold text-primary-700">{{ payment.planName }}</p>
                      <p class="text-sm text-primary-600 font-semibold">{{ formatDate(payment.createdAt) }}</p>
                      <p class="text-xs text-primary-500">{{ formatTime(payment.createdAt) }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="text-lg font-bold text-primary-700">{{ payment.organization }}</div>
                </td>

                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="text-2xl font-bold text-success-600">
                    ฿{{ payment.amount.toLocaleString() }}
                  </div>
                  <div class="text-sm text-success-500 font-semibold">{{ payment.currency }}</div>
                </td>

                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon
                        :icon="getPaymentMethodIcon(payment.paymentMethod)"
                        :class="getPaymentMethodIconColor(payment.paymentMethod)"
                        class="w-4 h-4"
                      />
                    </div>
                    <span class="text-lg font-bold text-primary-700 capitalize">
                      {{ formatPaymentMethod(payment.paymentMethod) }}
                    </span>
                  </div>
                </td>

                <td class="px-8 py-6 whitespace-nowrap">
                  <span
                    :class="[
                      'px-4 py-2 inline-flex text-sm font-bold rounded-xl',
                      getStatusColor(payment.status),
                    ]"
                  >
                    {{ formatStatus(payment.status) }}
                    <FontAwesomeIcon
                      v-if="recentlyUpdatedPayments.includes(payment.id)"
                      icon="sync-alt"
                      class="w-3 h-3 ml-2 text-primary-600 animate-spin"
                    />
                  </span>
                </td>

                <td class="px-8 py-6 whitespace-nowrap">
                  <div v-if="payment.subscription" class="text-sm">
                    <div class="flex items-center space-x-3">
                      <div
                        :class="[
                          'w-3 h-3 rounded-full',
                          payment.subscription.status === 'active'
                            ? 'bg-success-500'
                            : payment.subscription.status === 'expired'
                              ? 'bg-warning-500'
                              : 'bg-neutral-500',
                        ]"
                      ></div>
                      <span class="text-lg font-bold text-primary-700 capitalize">{{
                        payment.subscription.status
                      }}</span>
                    </div>
                    <div class="text-sm text-primary-600 font-semibold mt-2">
                      {{
                        formatDateRange(
                          payment.subscription.startDate,
                          payment.subscription.endDate,
                        )
                      }}
                    </div>
                  </div>
                  <div v-else class="text-lg text-neutral-500 font-semibold">No subscription</div>
                </td>

                <td class="px-8 py-6 whitespace-nowrap text-center">
                  <div class="flex space-x-3 justify-center" :class="getActionButtonsAlignment(payment)">
                    <button
                      @click="viewPaymentDetails(payment)"
                      class="px-4 py-2 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200"
                      title="View Details"
                    >
                      <FontAwesomeIcon icon="eye" class="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      v-if="payment.status === 'successful'"
                      @click="downloadReceipt(payment)"
                      class="px-4 py-2 text-success-600 bg-success-100 hover:bg-success-200 rounded-xl font-semibold transition-colors duration-200 border border-success-200"
                      title="Download Receipt"
                    >
                      <FontAwesomeIcon icon="download" class="w-4 h-4 mr-1" />
                      Receipt
                    </button>
                    <!-- Manual refresh button for pending payments -->
                    <button
                      v-if="payment.status === 'pending'"
                      @click="refreshSinglePayment(payment.id)"
                      :disabled="refreshingPayments.includes(payment.id)"
                      class="px-4 py-2 text-warning-600 bg-warning-100 hover:bg-warning-200 rounded-xl font-semibold transition-colors duration-200 border border-warning-200 disabled:opacity-50"
                      title="Check Status"
                    >
                      <FontAwesomeIcon
                        :icon="refreshingPayments.includes(payment.id) ? 'spinner' : 'refresh'"
                        :class="{ 'animate-spin': refreshingPayments.includes(payment.id) }"
                        class="w-4 h-4 mr-1"
                      />
                      Check
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.total > pageLimit"
          class="bg-gradient-to-r from-primary-50 to-secondary-50 px-8 py-6 flex items-center justify-between border-t border-primary-200"
        >
          <div class="flex items-center">
            <p class="text-sm font-semibold text-primary-700">
              Showing
              <span class="font-bold">{{ pagination.offset + 1 }}</span>
              to
              <span class="font-bold">{{
                Math.min(pagination.offset + pageLimit, pagination.total)
              }}</span>
              of
              <span class="font-bold">{{ pagination.total }}</span>
              results
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="previousPage"
              :disabled="pagination.offset === 0 || loading"
              class="px-6 py-3 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="!pagination.hasMore || loading"
              class="px-6 py-3 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-white rounded-2xl shadow-soft border border-primary-100">
        <div class="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FontAwesomeIcon icon="receipt" class="w-10 h-10 text-white" />
        </div>
        <h3 class="text-2xl font-bold text-primary-700 mb-3">No Payment History</h3>
        <p class="text-primary-600 mb-8 text-lg">
          {{
            selectedStatus
              ? `No ${selectedStatus} payments found.`
              : "You haven't made any payments yet."
          }}
        </p>
        <div class="space-x-4">
          <button
            v-if="selectedStatus"
            @click="clearFilters"
            class="px-6 py-3 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-xl font-semibold transition-colors duration-200 border border-primary-200"
          >
            Clear Filters
          </button>
          <router-link
            to="/homepage"
            class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg inline-flex items-center"
          >
            <FontAwesomeIcon icon="search" class="w-5 h-5 mr-3" />
            Browse Plans
          </router-link>
        </div>
      </div>

      <!-- Payment Details Modal -->
      <div
        v-if="showDetailsModal && selectedPayment"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        @click.self="closeDetailsModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative top-20 mx-auto">
          <div class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-white">Payment Details</h2>
              <button
                @click="closeDetailsModal"
                class="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-xl"
              >
                <FontAwesomeIcon icon="times" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="p-8 space-y-8">
            <!-- Transaction Info -->
            <div>
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="credit-card" class="w-5 h-5 mr-2 text-secondary-500" />
                Transaction Information
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="hashtag" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Transaction ID</span>
                    </div>
                    <span class="font-mono text-sm bg-primary-100 text-primary-700 px-3 py-2 rounded-lg font-bold">{{
                      selectedPayment.id
                    }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="calendar" class="w-4 h-4 text-secondary-600" />
                      <span class="text-sm font-semibold text-secondary-600">Date & Time</span>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-bold text-secondary-700">{{ formatDate(selectedPayment.createdAt) }}</p>
                      <p class="text-sm text-secondary-600 font-semibold">{{ formatTime(selectedPayment.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="info-circle" class="w-4 h-4 text-success-600" />
                      <span class="text-sm font-semibold text-success-600">Status</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span
                        :class="[
                          'px-4 py-2 inline-flex text-sm font-bold rounded-xl',
                          getStatusColor(selectedPayment.status),
                        ]"
                      >
                        {{ formatStatus(selectedPayment.status) }}
                      </span>
                      <button
                        v-if="selectedPayment.status === 'pending'"
                        @click="refreshSinglePayment(selectedPayment.id)"
                        :disabled="refreshingPayments.includes(selectedPayment.id)"
                        class="text-primary-600 hover:text-primary-700 disabled:opacity-50 p-2 hover:bg-primary-100 rounded-lg transition-colors"
                        title="Check latest status"
                      >
                        <FontAwesomeIcon
                          :icon="
                            refreshingPayments.includes(selectedPayment.id) ? 'spinner' : 'refresh'
                          "
                          :class="{ 'animate-spin': refreshingPayments.includes(selectedPayment.id) }"
                          class="w-4 h-4"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plan Info -->
            <div>
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="layer-group" class="w-5 h-5 mr-2 text-secondary-500" />
                Plan Information
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="tag" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Plan Name</span>
                    </div>
                    <span class="text-lg font-bold text-primary-700">{{ selectedPayment.planName }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="building" class="w-4 h-4 text-secondary-600" />
                      <span class="text-sm font-semibold text-secondary-600">Organization</span>
                    </div>
                    <span class="text-lg font-bold text-secondary-700">{{ selectedPayment.organization }}</span>
                  </div>
                </div>
                <div class="bg-white/50 rounded-xl p-4 border border-primary-200 mt-4">
                  <div class="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon icon="align-left" class="w-4 h-4 text-warning-600" />
                    <span class="text-sm font-semibold text-warning-600">Description</span>
                  </div>
                  <span class="text-lg font-bold text-warning-700">{{ selectedPayment.description }}</span>
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
                      <span class="text-sm font-semibold text-success-600">Amount</span>
                    </div>
                    <span class="text-2xl font-bold text-success-700">฿{{ selectedPayment.amount.toLocaleString() }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="coins" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Currency</span>
                    </div>
                    <span class="text-lg font-bold text-primary-700">{{ selectedPayment.currency }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="credit-card" class="w-4 h-4 text-secondary-600" />
                      <span class="text-sm font-semibold text-secondary-600">Payment Method</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <FontAwesomeIcon
                        :icon="getPaymentMethodIcon(selectedPayment.paymentMethod)"
                        :class="getPaymentMethodIconColor(selectedPayment.paymentMethod)"
                        class="w-4 h-4"
                      />
                      <span class="text-lg font-bold text-secondary-700 capitalize">
                        {{ formatPaymentMethod(selectedPayment.paymentMethod) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subscription Info -->
            <div v-if="selectedPayment.subscription">
              <h3 class="text-xl font-bold text-primary-700 mb-4 flex items-center">
                <FontAwesomeIcon icon="calendar-alt" class="w-5 h-5 mr-2 text-secondary-500" />
                Subscription Information
              </h3>
              <div class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl p-6 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="hashtag" class="w-4 h-4 text-primary-600" />
                      <span class="text-sm font-semibold text-primary-600">Subscription ID</span>
                    </div>
                    <span class="font-mono text-sm bg-primary-100 text-primary-700 px-3 py-2 rounded-lg font-bold">{{
                      selectedPayment.subscription.id
                    }}</span>
                  </div>
                  <div class="bg-white/50 rounded-xl p-4 border border-primary-200">
                    <div class="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon="info-circle" class="w-4 h-4 text-success-600" />
                      <span class="text-sm font-semibold text-success-600">Status</span>
                    </div>
                    <span
                      :class="[
                        'px-4 py-2 inline-flex text-sm font-bold rounded-xl',
                        selectedPayment.subscription.status === 'active'
                          ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border border-success-300'
                          : selectedPayment.subscription.status === 'expired'
                            ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border border-warning-300'
                            : 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-300',
                      ]"
                    >
                      {{
                        selectedPayment.subscription.status.charAt(0).toUpperCase() +
                        selectedPayment.subscription.status.slice(1)
                      }}
                    </span>
                  </div>
                </div>
                <div class="bg-white/50 rounded-xl p-4 border border-primary-200 mt-4">
                  <div class="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon icon="calendar" class="w-4 h-4 text-secondary-600" />
                    <span class="text-sm font-semibold text-secondary-600">Period</span>
                  </div>
                  <span class="text-lg font-bold text-secondary-700">
                    {{
                      formatDateRange(
                        selectedPayment.subscription.startDate,
                        selectedPayment.subscription.endDate,
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-center space-x-4">
              <button
                v-if="selectedPayment.status === 'successful'"
                @click="downloadReceipt(selectedPayment)"
                class="px-8 py-4 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl font-bold hover:from-success-600 hover:to-success-700 transition-all duration-200 shadow-lg flex items-center space-x-3"
              >
                <FontAwesomeIcon icon="download" class="w-5 h-5" />
                <span>Download Receipt</span>
              </button>
              <button
                v-if="selectedPayment.subscription"
                @click="viewSubscription(selectedPayment.subscription.id)"
                class="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg flex items-center space-x-3"
              >
                <FontAwesomeIcon icon="layer-group" class="w-5 h-5" />
                <span>View Subscription</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notifications -->
      <div v-if="notifications.length > 0" class="fixed bottom-4 right-4 z-50 space-y-2">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'p-4 rounded-lg shadow-lg border max-w-sm',
            notification.type === 'success'
              ? 'bg-green-50 border-green-200'
              : notification.type === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200',
          ]"
        >
          <div class="flex items-start">
            <FontAwesomeIcon
              :icon="
                notification.type === 'success'
                  ? 'check-circle'
                  : notification.type === 'error'
                    ? 'exclamation-circle'
                    : 'info-circle'
              "
              :class="[
                'w-5 h-5 mt-0.5 mr-3',
                notification.type === 'success'
                  ? 'text-green-600'
                  : notification.type === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600',
              ]"
            />
            <div class="flex-1">
              <p
                :class="[
                  'text-sm font-medium',
                  notification.type === 'success'
                    ? 'text-green-800'
                    : notification.type === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800',
                ]"
              >
                {{ notification.title }}
              </p>
              <p
                :class="[
                  'text-sm mt-1',
                  notification.type === 'success'
                    ? 'text-green-700'
                    : notification.type === 'error'
                      ? 'text-red-700'
                      : 'text-blue-700',
                ]"
              >
                {{ notification.message }}
              </p>
            </div>
            <button
              @click="removeNotification(notification.id)"
              :class="[
                'ml-2 text-xs hover:opacity-75',
                notification.type === 'success'
                  ? 'text-green-600'
                  : notification.type === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600',
              ]"
            >
              <FontAwesomeIcon icon="times" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { paymentApi } from '../api/payment'
import type { PaymentHistory } from '../types/payment'

const router = useRouter()

// State
const loading = ref(false)
const error = ref('')
const payments = ref<PaymentHistory[]>([])
const selectedPayment = ref<PaymentHistory | null>(null)
const showDetailsModal = ref(false)

// Auto-refresh state
const autoRefreshActive = ref(false)
const autoRefreshInterval = ref(30000) // 30 seconds
const refreshingPayments = ref<string[]>([])
const recentlyUpdatedPayments = ref<string[]>([])
const isOnline = ref(navigator.onLine)

// Notification system
type NotificationType = 'success' | 'error' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
}

const notifications = ref<Notification[]>([])

// Filters and Pagination
const selectedStatus = ref('')
const pageLimit = ref(25)
const pagination = ref({
  total: 0,
  limit: 25,
  offset: 0,
  hasMore: false,
})

// Timers
let autoRefreshTimer: number | null = null
const highlightTimers: Map<string, number> = new Map()

// Function to determine action button alignment
const getActionButtonsAlignment = (payment: PaymentHistory) => {
  const buttonCount = getVisibleButtonCount(payment)
  return buttonCount === 1 ? 'justify-center' : 'justify-end'
}

// Function to count visible buttons for a payment
const getVisibleButtonCount = (payment: PaymentHistory) => {
  let count = 1 // View details button is always visible

  if (payment.status === 'successful') {
    count++ // Download receipt button
  }

  if (payment.status === 'pending') {
    count++ // Refresh status button
  }

  return count
}

// Enhanced payment loading with change detection
const loadPaymentHistory = async (resetOffset = false, detectChanges = true) => {
  try {
    loading.value = true
    error.value = ''

    if (resetOffset) {
      pagination.value.offset = 0
    }

    const options: Record<string, string | number> = {
      limit: pageLimit.value,
      offset: pagination.value.offset,
    }

    if (selectedStatus.value) {
      options.status = selectedStatus.value
    }

    const data = await paymentApi.getPaymentHistory(options)

    // Store previous payments for change detection
    const previousPayments = payments.value
    payments.value = data.data
    pagination.value = data.pagination

    // Detect changes if this is an auto-refresh
    if (detectChanges && previousPayments.length > 0) {
      detectPaymentChanges(previousPayments, data.data)
    }
  } catch (err) {
    console.error('Failed to load payment history:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load payment history'
  } finally {
    loading.value = false
  }
}

// Detect changes in payment status
const detectPaymentChanges = (oldPayments: PaymentHistory[], newPayments: PaymentHistory[]) => {
  const oldPaymentMap = new Map(oldPayments.map((p) => [p.id, p]))

  for (const newPayment of newPayments) {
    const oldPayment = oldPaymentMap.get(newPayment.id)

    if (oldPayment && oldPayment.status !== newPayment.status) {
      console.log(
        `Payment status changed: ${newPayment.id} ${oldPayment.status} -> ${newPayment.status}`,
      )

      // Highlight the changed payment
      highlightPaymentUpdate(newPayment.id)

      // Determine notification type based on status
      let notificationType: NotificationType = 'info'
      if (newPayment.status === 'successful') {
        notificationType = 'success'
      } else if (newPayment.status === 'failed') {
        notificationType = 'error'
      }

      // Show notification
      addNotification({
        type: notificationType,
        title: `Payment ${formatStatus(newPayment.status)}`,
        message: `${newPayment.planName} payment status updated to ${newPayment.status}`,
      })
    }
  }
}

// Highlight payment update
const highlightPaymentUpdate = (paymentId: string) => {
  if (!recentlyUpdatedPayments.value.includes(paymentId)) {
    recentlyUpdatedPayments.value.push(paymentId)
  }

  // Clear existing timer for this payment
  const existingTimer = highlightTimers.get(paymentId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  // Set new timer to remove highlight after 5 seconds
  const timer = globalThis.setTimeout(() => {
    const index = recentlyUpdatedPayments.value.indexOf(paymentId)
    if (index > -1) {
      recentlyUpdatedPayments.value.splice(index, 1)
    }
    highlightTimers.delete(paymentId)
  }, 5000) as unknown as number

  highlightTimers.set(paymentId, timer)
}

// Helper: Get notification type from payment status
const getNotificationTypeFromStatus = (status: string): NotificationType => {
  if (status === 'successful') return 'success'
  if (status === 'failed') return 'error'
  return 'info'
}

// Helper: Update payment data in list
const updatePaymentInList = (paymentIndex: number, status: PaymentHistory) => {
  payments.value[paymentIndex] = {
    ...payments.value[paymentIndex],
    ...status,
    amount: status.amount,
    currency: status.currency,
    paymentMethod: status.paymentMethod,
    status: status.status,
    subscription: status.subscription,
    updatedAt: status.updatedAt,
  }
}

// Helper: Handle payment status change notification
const handlePaymentStatusChange = (paymentId: string, paymentIndex: number, oldStatus: string, newStatus: string) => {
  highlightPaymentUpdate(paymentId)

  addNotification({
    type: getNotificationTypeFromStatus(newStatus),
    title: 'Status Updated',
    message: `Payment status changed from ${oldStatus} to ${newStatus}`,
  })

  // If modal is open and showing this payment, update it
  if (selectedPayment.value && selectedPayment.value.id === paymentId) {
    selectedPayment.value = { ...payments.value[paymentIndex] }
  }
}

// Refresh single payment status
const refreshSinglePayment = async (paymentId: string) => {
  if (refreshingPayments.value.includes(paymentId)) return

  try {
    refreshingPayments.value.push(paymentId)

    console.log('Refreshing single payment:', paymentId)
    const status = await paymentApi.getPaymentStatus(paymentId)

    // Find and update the payment in our local list
    const paymentIndex = payments.value.findIndex((p) => p.id === paymentId)
    if (paymentIndex === -1) return

    const oldStatus = payments.value[paymentIndex].status
    updatePaymentInList(paymentIndex, status)

    // Show notification if status changed
    if (oldStatus !== status.status) {
      handlePaymentStatusChange(paymentId, paymentIndex, oldStatus, status.status)
    }
  } catch (err) {
    console.error('Failed to refresh payment status:', err)
    addNotification({
      type: 'error',
      title: 'Refresh Failed',
      message: 'Could not check payment status',
    })
  } finally {
    const index = refreshingPayments.value.indexOf(paymentId)
    if (index > -1) {
      refreshingPayments.value.splice(index, 1)
    }
  }
}

// Auto-refresh functionality
const toggleAutoRefresh = () => {
  autoRefreshActive.value = !autoRefreshActive.value

  if (autoRefreshActive.value) {
    startAutoRefresh()
    addNotification({
      type: 'info',
      title: 'Auto-refresh Started',
      message: `Monitoring payment status every ${autoRefreshInterval.value / 1000} seconds`,
    })
  } else {
    stopAutoRefresh()
    addNotification({
      type: 'info',
      title: 'Auto-refresh Stopped',
      message: 'Payment monitoring has been disabled',
    })
  }
}

const startAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }

  autoRefreshTimer = globalThis.window.setInterval(async () => {
    if (payments.value.length > 0 && isOnline.value) {
      console.log('Auto-refreshing payment history...')
      await loadPaymentHistory(false, true)
    }
  }, autoRefreshInterval.value)
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// Notification system
const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substring(2)

  notifications.value.push({
    id,
    ...notification,
  })

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeNotification(id)
  }, 5000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Network status monitoring
const handleOnlineStatus = () => {
  isOnline.value = navigator.onLine

  if (isOnline.value && autoRefreshActive.value) {
    // Resume auto-refresh when back online
    startAutoRefresh()
    addNotification({
      type: 'success',
      title: 'Back Online',
      message: 'Payment monitoring resumed',
    })
  } else if (!isOnline.value) {
    // Pause auto-refresh when offline
    stopAutoRefresh()
    addNotification({
      type: 'info',
      title: 'Offline',
      message: 'Payment monitoring paused',
    })
  }
}

const refreshPayments = () => {
  loadPaymentHistory(true, false)
}

const applyFilters = () => {
  loadPaymentHistory(true, false)
}

const clearFilters = () => {
  selectedStatus.value = ''
  pageLimit.value = 25
  loadPaymentHistory(true, false)
}

const nextPage = () => {
  if (pagination.value.hasMore && !loading.value) {
    pagination.value.offset += pageLimit.value
    loadPaymentHistory(false, false)
  }
}

const previousPage = () => {
  if (pagination.value.offset > 0 && !loading.value) {
    pagination.value.offset = Math.max(0, pagination.value.offset - pageLimit.value)
    loadPaymentHistory(false, false)
  }
}

const viewPaymentDetails = (payment: PaymentHistory) => {
  selectedPayment.value = payment
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedPayment.value = null
}

const viewSubscription = (subscriptionId: string) => {
  console.log('Viewing subscription:', subscriptionId)
  router.push('/subscriptions')
}

const downloadReceipt = async (payment: PaymentHistory) => {
  try {
    const receiptContent = generateReceiptText(payment)
    const blob = new Blob([receiptContent], { type: 'text/plain; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${payment.id}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download receipt:', err)
    addNotification({
      type: 'error',
      title: 'Download Failed',
      message: 'Failed to download receipt',
    })
  }
}

const generateReceiptText = (payment: PaymentHistory): string => {
  return `
PAYMENT RECEIPT
===============

Transaction ID: ${payment.id}
Date: ${formatDate(payment.createdAt)}
Time: ${formatTime(payment.createdAt)}

PLAN DETAILS:
Plan Name: ${payment.planName}
Organization: ${payment.organization}
Description: ${payment.description}

PAYMENT DETAILS:
Amount: ฿${payment.amount.toLocaleString()}
Currency: ${payment.currency}
Payment Method: ${formatPaymentMethod(payment.paymentMethod)}
Status: ${formatStatus(payment.status)}

${
  payment.subscription
    ? `SUBSCRIPTION DETAILS:
Subscription ID: ${payment.subscription.id}
Status: ${payment.subscription.status.charAt(0).toUpperCase() + payment.subscription.status.slice(1)}
Period: ${formatDateRange(payment.subscription.startDate, payment.subscription.endDate)}
`
    : ''
}
Thank you for your payment!

Generated on ${new Date().toLocaleString('en-US')}
`.trim()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${start} - ${end}`
}

const formatPaymentMethod = (method: string) => {
  const methodMap: Record<string, string> = {
    card: 'Credit/Debit Card',
    promptpay: 'PromptPay QR',
  }
  return methodMap[method] || method
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    successful: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    refunded: 'bg-purple-100 text-purple-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodIcon = (method: string) => {
  const iconMap: Record<string, string> = {
    card: 'credit-card',
    promptpay: 'qrcode',
  }
  return iconMap[method] || 'money-bill-wave'
}

const getPaymentMethodIconColor = (method: string) => {
  const colorMap: Record<string, string> = {
    card: 'text-blue-600',
    promptpay: 'text-green-600',
  }
  return colorMap[method] || 'text-gray-600'
}

// Lifecycle hooks
onMounted(() => {
  loadPaymentHistory()

  // Add online/offline event listeners
  globalThis.window.addEventListener('online', handleOnlineStatus)
  globalThis.window.addEventListener('offline', handleOnlineStatus)

  // Start auto-refresh by default for pending payments
  const hasPendingPayments = payments.value.some((p) => p.status === 'pending')
  if (hasPendingPayments) {
    autoRefreshActive.value = true
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()

  // Clear all highlight timers
  for (const timer of highlightTimers.values()) {
    clearTimeout(timer)
  }
  highlightTimers.clear()

  // Remove event listeners
  globalThis.window.removeEventListener('online', handleOnlineStatus)
  globalThis.window.removeEventListener('offline', handleOnlineStatus)
})
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation for newly updated rows */
.bg-blue-50 {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0% {
    background-color: #dbeafe;
    transform: scale(1.01);
  }
  50% {
    background-color: #bfdbfe;
  }
  100% {
    background-color: #dbeafe;
    transform: scale(1);
  }
}
</style>
