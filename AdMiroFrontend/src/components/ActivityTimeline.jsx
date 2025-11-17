import { Create, PencilSimple, Trash, CircleFill } from "phosphor-react";

export default function ActivityTimeline({ logs }) {
  const getActionIcon = action => {
    switch (action) {
      case "create":
        return <Create size={18} weight="bold" />;
      case "update":
        return <PencilSimple size={18} weight="bold" />;
      case "delete":
        return <Trash size={18} weight="bold" />;
      case "status_change":
        return <CircleFill size={18} weight="bold" />;
      default:
        return <CircleFill size={18} weight="bold" />;
    }
  };

  const getActionColor = action => {
    switch (action) {
      case "create":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "update":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "delete":
        return "text-red-600 bg-red-50 border-red-200";
      case "status_change":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getEntityColor = entityType => {
    switch (entityType) {
      case "display":
        return "text-blue-700";
      case "advertisement":
        return "text-purple-700";
      case "loop":
        return "text-amber-700";
      case "user":
        return "text-green-700";
      default:
        return "text-gray-700";
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No activity to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs.map((log, index) => (
        <div key={log._id} className="relative">
          {/* Timeline line */}
          {index !== logs.length - 1 && (
            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200"></div>
          )}

          {/* Timeline item */}
          <div className="flex gap-4">
            {/* Icon circle */}
            <div
              className={`mt-2 relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getActionColor(
                log.action
              )}`}>
              {getActionIcon(log.action)}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {log.details?.description || "System Activity"}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 ${getEntityColor(
                          log.entityType
                        )}`}>
                        {log.entityType}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Additional details */}
                {log.details?.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      {Object.entries(log.details.metadata)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" • ")}
                    </p>
                  </div>
                )}

                {/* User info */}
                {log.userId && (
                  <div className="mt-2 text-xs text-gray-500">
                    by{" "}
                    <span className="font-medium">
                      {log.userId.firstName && log.userId.lastName
                        ? `${log.userId.firstName} ${log.userId.lastName}`
                        : log.userId.username || "Unknown User"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
