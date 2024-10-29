<script setup lang="ts">
import { watch } from 'vue';
import * as Diff2Html from 'diff2html';

const { submits, currentSubmit, deadline } = defineProps<{
  submits: Submit[];
  currentSubmit: number;
  deadline: Date;
}>();

type Submit = {
  points: number;
  comments: number;
  num: number;
  submitted: Date;
};

let a = Math.max(currentSubmit - 1, 1);
let b = currentSubmit;

let diffHtmlOutput = '';

function formatInfo(submit: Submit) {
  let result = '(';
  if (submit.points !== null) {
    result += `${submit.points} point${submit.points !== 1 ? 's' : ''}`;
  }
  if (submit.comments > 0) {
    if (submit.points != null) {
      result += ', ';
    }
    result += `${submit.comments} comment${submit.comments !== 1 ? 's' : ''}`;
  }

  return `${result})`;
}

watch(
  () => a != b,
  async () => {
    const result = await fetch(`../${a}-${b}.diff`);
    const diff = await result.text();
    diffHtmlOutput = Diff2Html.html(diff, {
      matching: 'lines',
      outputFormat: 'side-by-side',
      drawFileList: false
    });
  },
  { immediate: true }
);
</script>

<template>
  <ul>
    <li v-for="submit in submits" :key="submit.num">
      <input type="radio" :group="a" :value="submit.num" />
      <input type="radio" :group="b" :value="submit.num" :disabled="submit.num <= a" />
      <a :href="`../${submit.num}#src`">
        <strong>#{submit.num}</strong>
      </a>
      <strong v-if="submit.submitted > deadline" class="text-danger">
        <TimeAgo datetime="{submit.submitted}" rel="{deadline}" suffix="after the deadline" />
      </strong>
      <template v-else>{{ new Date(submit.submitted).toLocaleString('cs') }}</template>
      <span v-if="submit.points != null || submit.comments > 0" class="text-muted">
        {{ formatInfo(submit) }}
      </span>
    </li>
    <div class="code-diff" v-html="diffHtmlOutput"></div>
  </ul>
</template>

<style>
ul {
  list-style: none;
  padding-left: 0;
}
</style>
