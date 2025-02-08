const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// Debug Logger
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = "MyAPP.LOG";

castDebugLogger.setEnabled(true);
castDebugLogger.loggerLevelByTags = {
  LOG_TAG: cast.framework.LoggerLevel.DEBUG,
};

// Modify interceptor to use `contentUrl` directly
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (request) => {
    castDebugLogger.info(LOG_TAG, "Intercepting LOAD request");

    if (!request.media || !request.media.contentUrl) {
      castDebugLogger.error(LOG_TAG, "No contentUrl provided!");
      return Promise.reject();
    }

    castDebugLogger.warn(LOG_TAG, "Playable URL:", request.media.contentUrl);

    // Set media type based on extension
    const contentTypeMap = {
      mp4: "video/mp4",
      m3u8: "application/x-mpegurl",
      dash: "application/dash+xml",
    };

    const extension = request.media.contentUrl.split(".").pop().toLowerCase();
    request.media.contentType = contentTypeMap[extension] || "video/mp4";

    // Set metadata if provided
    if (request.media.metadata) {
      let metadata = new cast.framework.messages.GenericMediaMetadata();
      metadata.title = request.media.metadata.title || "Unknown Title";
      metadata.images = request.media.metadata.images || [];
      request.media.metadata = metadata;
    }

    return request;
  }
);

context.start();
