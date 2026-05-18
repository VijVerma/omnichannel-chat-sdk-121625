/* eslint-disable @typescript-eslint/no-explicit-any */

import exceptionThrowers from "../../src/utils/exceptionThrowers"

describe('exceptionThrowers', () => {
    it('throwChatSDKError() should throw exception properly', () => {
        const chatSDKError: any = "TestError";
        const e = new Error("test");
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        const expectedExceptionDetails = {
            response: chatSDKError,
            errorObject: `${e}`
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, e, scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });

    it('throwChatSDKError() without error object should be not part of the exception details', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        const expectedExceptionDetails = {
            response: chatSDKError
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });

    it('throwChatSDKError() with additional telemetry data should be passed to scenarioMarker.failScenario()', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const telemetryData = {
            chatId: 'chatId',
            requestId: 'requestId'
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, telemetryData);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].chatId).toBeDefined();
            expect(scenarioMarker.failScenario.mock.calls[0][1].requestId).toBeDefined();
            expect(scenarioMarker.failScenario.mock.calls[0][1].chatId).toBe(telemetryData.chatId);
            expect(scenarioMarker.failScenario.mock.calls[0][1].requestId).toBe(telemetryData.requestId);
        }
    });

    it('throwChatSDKError() with additional message should call console.error()', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const message = "message";

        jest.spyOn(console, 'error');

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, {}, message);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(console.error).toHaveBeenCalledWith(message);
        }
    });

    // ADO 6373382: Tests for diagnostic data (Tier 1 telemetry fields)
    it('throwChatSDKError() with diagnosticData should include all fields in exception details', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const diagnosticData = {
            clientElapsedMs: 1234,
            configuredTimeoutMs: 5000,
            cancellationReason: 'timeout',
            online: false
        };

        const expectedExceptionDetails = {
            response: chatSDKError,
            clientElapsedMs: 1234,
            configuredTimeoutMs: 5000,
            cancellationReason: 'timeout',
            online: false
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, {}, undefined, diagnosticData);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });

    it('throwChatSDKError() with partial diagnosticData should include only provided fields', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const diagnosticData = {
            clientElapsedMs: 567,
            online: true
        };

        const expectedExceptionDetails = {
            response: chatSDKError,
            clientElapsedMs: 567,
            online: true
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, {}, undefined, diagnosticData);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
            expect(actualExceptionDetails.response).toBe(expectedExceptionDetails.response);
            expect(actualExceptionDetails.clientElapsedMs).toBe(expectedExceptionDetails.clientElapsedMs);
            expect(actualExceptionDetails.online).toBe(expectedExceptionDetails.online);
            expect(actualExceptionDetails.configuredTimeoutMs).toBeUndefined();
            expect(actualExceptionDetails.cancellationReason).toBeUndefined();
        }
    });

    it('throwChatConfigRetrievalFailure() with diagnosticData should pass it through to throwChatSDKError', () => {
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const diagnosticData = {
            clientElapsedMs: 890,
            online: false,
            cancellationReason: 'network_error'
        };

        try {
            exceptionThrowers.throwChatConfigRetrievalFailure(new Error('network'), scenarioMarker, telemetryEvent, diagnosticData);
        } catch (e : any) {
            const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
            expect(actualExceptionDetails.clientElapsedMs).toBe(890);
            expect(actualExceptionDetails.online).toBe(false);
            expect(actualExceptionDetails.cancellationReason).toBe('network_error');
        }
    });

    it('throwChatConfigRetrievalFailure() without diagnosticData should work (backward compatibility)', () => {
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        try {
            exceptionThrowers.throwChatConfigRetrievalFailure(new Error('test'), scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe('ChatConfigRetrievalFailure');
            expect(scenarioMarker.failScenario).toHaveBeenCalled();
            // Should not crash, diagnostic fields just omitted
            const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
            expect(actualExceptionDetails.response).toBe('ChatConfigRetrievalFailure');
        }
    });

    it('throwChatSDKError() without diagnosticData should work (backward compatibility)', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        const expectedExceptionDetails = {
            response: chatSDKError
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });
});