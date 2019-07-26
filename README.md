# tinkerhub-discovery

This library contains base classes for building and consuming discovery
mechanisms using JavaScript and TypeScript.

It is intended to be used to implement some sort of discovery mechanism, such
as those for [SSDP](https://github.com/tinkerhub/tinkerhub-ssdp) and
[MDNS](https://github.com/tinkerhub/tinkerhub-mdns).

The library is made available via NPM:

```
npm install tinkerhub-discovery
```

## API

Two basic functionality of a discovery instance is exposed via the type
`Discovery`:

```typescript
const discovery = new DiscoveryInstanceHere();

// Fetch services available
for(const service of discovery.services) {
  // Do something with a service found
}

// Get or find services
const viaId = discovery.get('idOfService');
const singleViaFilter = discovery.find(service => /* filter code here */);
const allViaFilter = discovery.find(service => service.someData === 'test');

// Listen to when services become available or unavailable
discovery.onAvailable(service => /* service is now available */);
discovery.onUnavailable(service => /* service is no longer available */);

// Some discoveries support updates
discovery.onUpdate((service, previousService) => /* service has been updated */)

// When done using a discovery it should be destroyed
discovery.destroy();
```

## Filtered and mapped views

Discovery instances can be filtered, which provides a live filtered view that
supports events:

```typescript
const filtered = discovery.filter(service => /* return true to include in filtered view */);

// Listen to events as with the main discovery instance
filtered.onAvailable(service => ...);

// Remember to destroy the view if no longer needed
filtered.destroy();
```

Similar to filtering it is possible to map services into another object, as long
as the mapped object contains an identifier:

```typescript
const mapped = discovery.map(service => new CustomService(service));
```

Mapping supports returning promises to perform asynchronous functions during
mapping:

```typescript
const mapped = discovery.map(async service => await loadService(service));
```

Mappers may return `null` if they do not wish to map a service, in which case
the discovery acts as it was filtered out.

Mapping has an advanced mode where it's possible to optionally react to
updated and unavailable services:

```typescript
const mapped = discovery.map({
  create: service => new CustomService(service),

  update: ({ service, previousService, previousMappedService }) => {
    /*
     * `service` points to the updated service to map
     * `previousService` is the previous version of the service to map
     * `previousMappedService` is what `create` or `update` mapped to previously
     * 
     * Either:
     * 
     * 1) Return null/undefined to remove the service
     * 2) Return the previously mapped service
     * 3) Return a new mapped service
     * 
     */
  },

  destroy: mappedService => /* perform some destruction of the mapped service */
})
```

Combining filtering and mapping can make it easy to find and create a more
specific API for a service, like this example that looks for Philips Hue
bridges:

```typescript
import { SSDPDiscovery } from 'tinkerhub-ssdp';

const root = new SSDPDiscovery();

const filteredAndMapped = root
  .filter(service => service.headers['HUE-BRIDGEID'])
  .map(service => new HueBridge(service));

filteredAndMapped.onAvailable(hueBridge => /* instance of HueBridge is available */);

// To shutdown discovery (will destroy the filtered and mapped views)
root.destroy();
```

## Manual discovery

If you have a need to keep a manually updated list of services, it's possible
to create an instance of `ManualDiscovery` and add/remove services as needed:

```typescript
import { ManualDiscovery } from 'tinkerhub-discovery';

const discovery = new ManualDiscovery<ServiceType>();

// Add services
discovery.add(new ServiceType(...));

// Remove services
discovery.remove('idOfService');
discovery.remove(serviceInstance);

// Set the exact services available
discovery.set([ new ServiceType(...) ]);
```

## Building a custom discovery

There are a few ways to build a custom discovery, with the two main ways being:

* Event-based discovery, services are added or removed when changed
* Sync-based discovery, services are discovered in bulk 

A very basic example would be this discovery that listens for incoming UDP
packets and just adds them as services:

```javascript
const dgram = require('dgram');
const { BasicDiscovery } = require('tinkerhub-discovery');

class CustomDiscovery extends BasicDiscovery {
  constructor() {
    super('custom');

    this.socket = dgram.createSocket('udp4');
    this.socket.bind();
    this.socket.on(12345, '224.1.1.1', 'listening', () => {
      this.socket.addMembership('224.1.1.1');
      this.socket.setBroadcast(true);
    });
    this.socket.on('message', msg => {
      // Parse incoming message here
      const service = {
        id: extractSomeSortOfId(msg),
        message: msg
      };

      // Add it to the list of services
      this.addService(service);
    });
  }

  destroy() {
    this.socket.destroy();

    super.destroy();
  }
}
```

The above discovery would never remove any services, but extending
`ExpiringDiscovery` would activate time based and remove services based on when
they were last seen:

```javascript
const dgram = require('dgram');
const { ExpiringDiscovery } = require('tinkerhub-discovery');

class CustomDiscovery extends ExpiringDiscovery {
  constructor() {
    super('custom', {
      maxStaleTime: 60*1000 /* milliseconds */
    });

    this.socket = dgram.createSocket('udp4');
    this.socket.bind();
    this.socket.on(12345, '224.1.1.1', 'listening', () => {
      this.socket.addMembership('224.1.1.1');
      this.socket.setBroadcast(true);
    });
    this.socket.on('message', msg => {
      // Parse incoming message here
      const service = {
        id: extractSomeSortOfId(msg),
        message: msg
      };

      // Add it to the list of services
      this.addService(service);
    });
  }

  destroy() {
    this.socket.destroy();

    super.destroy();
  }
}
```
