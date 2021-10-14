import { Page } from 'puppeteer';
import { Bot } from '..';
import { clickText } from '../pptr-helpers';

export const attach = (bot: Bot) => {
	console.log('Running eventdemo feature...');

	bot.on('joined', ({ meetURL }) => {
		console.log('i joined a meeting!', meetURL);
		bot.addJob(postToChatJob('Hello Team-Balena!'));
	});

	const postToChatJob = (text: string) => {
		return async (page: Page) => {
			console.log('open chat section and send a message to all');
			await clickText(page, 'chat');
			await page.waitForTimeout(1500);
			// await page.screenshot({ path: 'after-chat-open.png' });

			await page.keyboard.type(text, { delay: 10 });
			await page.keyboard.press('Enter');
			// await page.screenshot({ path: 'after-chat.png' });

			console.log('close chat section again');
			await clickText(page, 'chat');
			await page.waitForTimeout(1500);
			// await page.screenshot({ path: 'after-chat-open.png' });
		};
	};

	let sayHelloInProgress = 0;
	bot.on('raw_caption', ({ caption }) => {
		if (!caption) {
			return;
		}
		const helloCmd = /say[^a-z]*hello[^a-z]*jarvis|robot[^a-z]*help[^a-z]*me/i;
		if (
			helloCmd.test(caption.text) &&
			new Date().getTime() - sayHelloInProgress > 10_000
		) {
			console.log('saying hello to my masters');
			sayHelloInProgress = new Date().getTime();
			bot.addJob(postToChatJob('What can I do for you, Sir?'));
		}
	});

	bot.on('chat', (event) => {
		console.log('CHAT', event);
		if (/(do|say)[^a-z]*something[^a-z]*(jarvis|hubot)/i.test(event.text)) {
			bot.addJob(postToChatJob("I'm ready for your text commands"));
		}
	});

	bot.on('left', ({ meetURL }) => {
		console.log('i left a meeting!', meetURL);
	});
};
