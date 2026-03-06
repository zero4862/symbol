---
title: Transaction Errors
---

# Listening to Transaction Errors

The <ws:status> WebSocket channel sends real-time notifications when a <transaction:> related to a specific <account:>
is rejected by the network.
Instead of polling the <get:/transactionStatus/{hash}> endpoint, the `status` channel pushes error details as soon as
the network rejects a transaction.

This tutorial shows how to subscribe to the `status` channel and display errors reported by the network.

## Prerequisites

Before you start, make sure to:

* Set up your development environment.
  See [Setting Up a Development Environment](../start/setup.md).
* Have the address of the <account:> to monitor.
  See [Creating an Account from a Private Key](../accounts/create-from-private-key.md) or
  [Creating an Account by Using a Wallet](../../userbook/wallet/create-account.md).

Additionally, install the language-specific WebSocket library:

=== ":simple-python: Python"

    Install the `websockets` library:

    ```bash
    pip install websockets
    ```

=== ":simple-javascript: JavaScript"

    This tutorial uses the native `WebSocket` API available in Node.js 22 or later.
    No additional packages are required.

## Full Code

{% import 'tutorial.jinja2' as tutorial with context %}

{{ tutorial.code_full('devbook/websockets/listen-transaction-error', ['py', 'js']) }}

The snippet uses the `NODE_URL` environment variable to set the Symbol API <node:>.
If no value is provided, a default one is used.
The WebSocket URL is derived from `NODE_URL` by replacing the HTTP protocol with the WebSocket protocol and appending
`/ws`.

The program runs until interrupted with `Ctrl+C`, which triggers the unsubscribe step before closing the connection.

## Code Explanation

### Resolving the Monitored Address

{{ tutorial.code_snippet(['py:11:15', 'js:6:8']) }}

The `status` channel is scoped to a specific address, so the code needs to know which <account:> to monitor.
The channel notifies whenever the address participates in a rejected transaction, whether as sender, recipient, or any
other role (for example, cosigner in an <aggregate transaction:>).

The address is read from the `MONITOR_ADDRESS` environment variable.

### Connecting to the WebSocket

{{ tutorial.code_snippet(['py:18:23', 'js:10:19']) }}

The code opens a WebSocket connection to the node's `/ws` endpoint.
Upon connecting, the server sends a message containing a unique identifier (`uid`) that must be included in all
subsequent subscription requests.

See the [WebSocket reference](../reference/websockets/index.md) for details on the connection protocol.

### Subscribing to the Status Channel

{{ tutorial.code_snippet(['py:25:30', 'js:21:24']) }}

The code subscribes to the <ws:status> channel scoped to the monitored address.
This channel notifies whenever a transaction involving the address is rejected by the network, providing the error code
and the transaction hash.

### Handling Messages

{{ tutorial.code_snippet(['py:32:41', 'js:26:35']) }}

The code listens for incoming messages until the program is interrupted.
Each message follows the [TransactionStatusDTO](../reference/rest/symbol.md#model-TransactionStatusDTO) schema
and contains:

* **hash**: The hash of the rejected transaction.
* **code**: The error code explaining why the transaction was rejected.
    See the [TransactionStatusEnum](../reference/rest/symbol.md#model-TransactionStatusEnum) schema for all possible
    values.

### Unsubscribing on Exit

{{ tutorial.code_snippet(['py:43:48', 'js:37:43']) }}

When the program is interrupted (`Ctrl+C`), the code sends an unsubscribe message before closing the connection.
This ensures a clean disconnection from the node.

## Output

To test the listener, start the program in one terminal, then send an invalid transaction involving the monitored
address in a separate terminal.
In this example, a [Transfer Transaction](../transactions/transfer.md) with insufficient balance was sent, causing the
network to reject it with `Failure_Core_Insufficient_Balance`.

```text linenums="1" hl_lines="5"
--8<-- 'devbook/websockets/listen-transaction-error.log'
```

The output shows:

* **Address** (line 2): The monitored address.
* **Connection** (line 3): The WebSocket connection is established and the server returns a unique `uid`.
* **Subscription** (line 4): The `status` channel is subscribed.
* **Error** (line 5): The network rejects the transaction with `Failure_Core_Insufficient_Balance`.
* **Unsubscribe** (line 6): On `Ctrl+C`, the code unsubscribes from the `status` channel.

## Conclusion

This tutorial showed how to:

| Step                                                              | Related documentation                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Subscribe to status channel](#subscribing-to-the-status-channel) | <ws:status>                                                                    |
| [Handle error messages](#handling-messages)                       | [TransactionStatusDTO](../reference/rest/symbol.md#model-TransactionStatusDTO) |
