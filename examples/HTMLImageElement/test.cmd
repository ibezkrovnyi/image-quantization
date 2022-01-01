@echo off
call pnpm build
call http-server
start index.html
