import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { useAuth } from "./AuthContext";
import { colors, commonStyles, buttonHoverEffect } from "./styles";

// Key for localStorage
const FORM_DATA_KEY = "createGathering_formData";

// Type for a single time slot
type TimeSlot = {
  id: number;
  date: string;
  startTime: string;
};

export function CreateGathering() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  // State for basic form fields
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("Australia/Melbourne");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(2);

  // Default date to 3 days ahead
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  };

  // State for dynamic time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, date: getDefaultDate(), startTime: "" },
  ]);
  const [nextId, setNextId] = useState(2);

  // Restore form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTitle(parsed.title || "");
        setLocation(parsed.location || "");
        setTimezone(parsed.timezone || "Australia/Melbourne");

        if (parsed.timeSlots && parsed.timeSlots.length > 0) {
          setTimeSlots(parsed.timeSlots);
          const maxId = Math.max(
            ...parsed.timeSlots.map((slot: TimeSlot) => slot.id)
          );
          setNextId(maxId + 1);
        }

        if (parsed.duration) {
          setDuration(parsed.duration);
        }

        localStorage.removeItem(FORM_DATA_KEY);
      } catch (err) {
        console.error("Failed to restore form data:", err);
      }
    }
  }, []);

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { id: nextId, date: getDefaultDate(), startTime: "" },
    ]);
    setNextId(nextId + 1);
  };

  const removeTimeSlot = (id: number) => {
    if (timeSlots.length === 1) {
      setError("You must have at least one time slot");
      return;
    }
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
    setError(null);
  };

  const updateTimeSlot = (id: number, field: keyof TimeSlot, value: string) => {
    setTimeSlots(
      timeSlots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const validateTimeSlots = (): string | null => {
    const today = new Date().toISOString().split("T")[0];

    for (const slot of timeSlots) {
      if (!slot.date || !slot.startTime) {
        return "All time slots must have a date and start time";
      }

      if (slot.date < today) {
        return "Cannot create time slots in the past";
      }
    }
    return null;
  };

  const formatTimeSlotsForBackend = () => {
    return timeSlots.map((slot) => {
      const startDate = new Date(`${slot.date}T${slot.startTime}:00`);
      const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

      const start = `${slot.date}T${slot.startTime}:00`;

      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      const endDateStr = endDate.toISOString().split("T")[0];
      const end = `${endDateStr}T${endHours}:${endMinutes}:00`;

      const dateObj = new Date(slot.date + "T00:00:00");
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const startDateTime = new Date(`${slot.date}T${slot.startTime}:00`);
      const formattedTime = startDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const label = `${formattedDate} @ ${formattedTime}`;
      return { start, end, label };
    });
  };

  const calculateRsvpDeadline = () => {
    const sortedSlots = [...timeSlots].sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
    );
    const earliest = sortedSlots[0];

    const deadlineDate = new Date(`${earliest.date}T${earliest.startTime}:00`);
    deadlineDate.setHours(deadlineDate.getHours() - 24);

    return deadlineDate.toISOString().split(".")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !location) {
      setError("Please fill in all required fields");
      return;
    }

    const timeSlotError = validateTimeSlots();
    if (timeSlotError) {
      setError(timeSlotError);
      return;
    }

    if (!isAuthenticated || !token) {
      const formData = { title, location, timezone, timeSlots, duration };
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
      navigate("/login?redirect=/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gatheringData = {
        title,
        location,
        timezone,
        timeOptions: formatTimeSlotsForBackend(),
        rsvpDeadline: calculateRsvpDeadline(),
      };

      const response = await fetch(`${API_URL}/gatherings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gatheringData),
      });

      if (!response.ok) {
        throw new Error("Failed to create gathering");
      }

      const data = await response.json();
      console.log("Created gathering:", data);

      localStorage.removeItem(FORM_DATA_KEY);
      navigate(`/gathering/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create gathering"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={commonStyles.pageContainer}>
      <div style={commonStyles.card}>
        <h1 style={commonStyles.heading}>Create New Gathering</h1>
        <p style={commonStyles.subheading}>
          Set up your gathering details and available time slots
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Title Field */}
          <div>
            <label style={commonStyles.label}>Gathering Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend Brunch"
              style={commonStyles.input}
              required
            />
          </div>

          {/* Location Field */}
          <div>
            <label style={commonStyles.label}>Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Melbourne, VIC, Australia"
              style={commonStyles.input}
              required
            />
          </div>

          {/* Timezone Field */}
          <div>
            <label style={commonStyles.label}>Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={commonStyles.input}
            >
              <option value="Australia/Sydney">
                Australia/Sydney (AEDT/AEST)
              </option>
              <option value="Australia/Melbourne">
                Australia/Melbourne (AEDT/AEST)
              </option>
              <option value="Australia/Brisbane">
                Australia/Brisbane (AEST)
              </option>
              <option value="Australia/Perth">Australia/Perth (AWST)</option>
              <option value="Australia/Adelaide">
                Australia/Adelaide (ACST)
              </option>
            </select>
            <p style={commonStyles.helperText}>
              Time zone for this gathering's location
            </p>
          </div>

          {/* Duration Field */}
          <div>
            <label style={commonStyles.label}>Event Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={commonStyles.input}
            >
              <option value={1}>1 hour</option>
              <option value={1.5}>1.5 hours</option>
              <option value={2}>2 hours</option>
              <option value={2.5}>2.5 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
            </select>
            <p style={commonStyles.helperText}>
              All time slots will have this duration
            </p>
          </div>

          {/* Dynamic Time Slots Section */}
          <div
            style={{
              backgroundColor: colors.background,
              padding: "20px",
              borderRadius: "12px",
              border: `2px dashed ${colors.border}`,
            }}
          >
            <label
              style={{
                ...commonStyles.label,
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              Available Time Slots *
            </label>

            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "flex-start",
                }}
              >
                {/* Date Input */}
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    value={slot.date}
                    onChange={(e) =>
                      updateTimeSlot(slot.id, "date", e.target.value)
                    }
                    style={commonStyles.input}
                    required
                  />
                </div>

                {/* Start Time Input */}
                <div style={{ flex: 1 }}>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) =>
                      updateTimeSlot(slot.id, "startTime", e.target.value)
                    }
                    style={commonStyles.input}
                    required
                  />
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeTimeSlot(slot.id)}
                  disabled={timeSlots.length === 1}
                  style={{
                    ...commonStyles.buttonDanger,
                    padding: "10px 16px",
                    fontSize: "14px",
                    backgroundColor:
                      timeSlots.length === 1 ? colors.border : colors.danger,
                    cursor: timeSlots.length === 1 ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) =>
                    timeSlots.length > 1 && buttonHoverEffect.danger.enter(e)
                  }
                  onMouseLeave={(e) =>
                    timeSlots.length > 1 && buttonHoverEffect.danger.leave(e)
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Add Time Slot Button */}
            <button
              type="button"
              onClick={addTimeSlot}
              style={{
                ...commonStyles.buttonSecondary,
                marginTop: "5px",
              }}
              onMouseEnter={buttonHoverEffect.accent.enter}
              onMouseLeave={buttonHoverEffect.accent.leave}
            >
              + Add Time Slot
            </button>
          </div>

          {/* Error Message */}
          {error && <div style={commonStyles.errorBox}>⚠️ {error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...commonStyles.buttonPrimary,
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              marginTop: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? colors.border : colors.success,
            }}
            onMouseEnter={loading ? undefined : buttonHoverEffect.success.enter}
            onMouseLeave={loading ? undefined : buttonHoverEffect.success.leave}
          >
            {loading ? "Creating..." : "Create Gathering"}
          </button>
        </form>

        <p
          style={{
            ...commonStyles.helperText,
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          * Required fields
        </p>
      </div>
    </div>
  );
}
