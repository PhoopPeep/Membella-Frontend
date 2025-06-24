<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <div class="flex items-center space-x-2">
        <SidebarTrigger />
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">$</div>
          <p class="text-xs text-muted-foreground">Last 12 months</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Members</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"></div>
          <p class="text-xs text-muted-foreground">Active subscribers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active Plans</CardTitle>
          <CreditCard class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"></div>
          <p class="text-xs text-muted-foreground">Available plans</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Growth</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">+12%</div>
          <p class="text-xs text-muted-foreground">From last month</p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Last 12 months revenue data</CardDescription>
        </CardHeader>
        <CardContent class="pl-2">
          <ResponsiveContainer width="100%" height="350">
            <BarChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Members by Plan</CardTitle>
          <CardDescription>Distribution of members across plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              class="flex items-center"
            >
              <div class="w-2 h-2 rounded-full bg-blue-600 mr-3"></div>
              <div class="flex-1">
                <p class="text-sm font-medium"></p>
                <p class="text-xs text-muted-foreground">members</p>
              </div>
              <div class="text-sm font-medium"></div>
            </div>
            <p class="text-sm text-muted-foreground">
              No plans created yet
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>