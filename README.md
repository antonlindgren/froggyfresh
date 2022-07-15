# FroggyFresh Discord Bot

## What is it
FroggyFresh is a HELL FRESH discord bot, named after the greatest rapper of our time [Froggy Fresh](https://www.youtube.com/watch?v=XArx0ASwyDc).
It's my (@antonlindgren) first serious nodejs project, in which I try to learn the language, with my friend @jimjardland.
We use it to track our friends when they play eSportal. We will most likely also add non-esportal-related features.

## Usage

**Prerequisites**: Docker, node, npm

- Create a .env (see example)
- `docker-compose up -d`
- `npm run migrate up`
- `npm run migrate:discord`
- `npm start`

## Commands

When the bot is added to discord, you can write `/esportal nickname` for it to track you (or someone else).
