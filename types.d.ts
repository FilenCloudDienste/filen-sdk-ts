declare module "crypto-api-v1" {
	export function hash(hash: string, input: string): string
}

declare module "socket.io-client" {
	export type SocketHandle = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		on(event: string, listener: (data: any) => void): void
		disconnect(): void
		connected: boolean
		disconnected: boolean
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		emit(event: string, data: any): void
	}

	export default function io(
		url: string,
		options?: { path?: string; reconnect?: boolean; reconnection?: boolean; transports?: string[]; upgrade?: boolean }
	): SocketHandle
}
