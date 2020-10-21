<template>
	<v-layout column>
		<v-flex>
			<code-input solo></code-input>
		</v-flex>
		<v-flex>
			<event-list></event-list>
		</v-flex>
	</v-layout>
</template>

<script>
'use strict'

import { mapState } from 'vuex'

export default {
	computed: {
		...mapState({
			isLocal: state => state.isLocal,
			}),
		}
	}
	//alert(new Date());
</script>
