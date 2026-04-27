import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
	@Get()
	getHealth() {
		return {
			status: "ok",
			service: "authorized-ticketing-api",
		};
	}

	@Get("time")
	time() {
		return { time: new Date().toISOString(), ping: true, version: '1.0.2' };
	}
}
