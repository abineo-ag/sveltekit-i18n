<script lang="ts">
	import { setLanguage, availableLanguages, t } from './lib/i18n';
    setLanguage(availableLanguages[0]);
</script>

<main>
    <p>{$t.people.alice}</p>
    <p>{$t.people.any('Markus')}</p>
</main>
