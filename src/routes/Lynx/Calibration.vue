<template>
  <v-layout row wrap>
      <v-flex xs12 sm6 md6 lg4 shrink>
        <xy-tilt-panel></xy-tilt-panel>
      </v-flex>
      <v-flex xs12 sm6 md6 lg4 shrink>
        <z-probe-offset></z-probe-offset>
      </v-flex>
    <v-flex xs12 sm12 md12 lg12 shrink>
      <xy-tool-offset></xy-tool-offset>
    </v-flex>
  </v-layout>
</template>
