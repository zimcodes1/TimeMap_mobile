import React, {
	useState,
	useMemo,
	useRef,
	useEffect,
	useCallback,
} from "react";
import {
	View,
	StyleSheet,
	Pressable,
	PanResponder,
	ScrollView,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/common/Text";
import { Session, SessionStatus } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function getSessionDotColor(s: Session): string {
	if (s.isExam) {
		return "#8B5CF6"; // Purple for exams
	}
	switch (s.status) {
		case "scheduled":
		case "held":
			return colors.primary; // Green (#10B981)
		case "not_held":
		case "cancelled":
			return colors.danger; // Red (#EF4444)
		case "postponed":
			return colors.info; // Blue (#3B82F6)
		case "shifted":
			return colors.warning; // Orange (#F59E0B)
		default:
			return colors.primary;
	}
}

export interface DayGridCell {
	dateStr: string; // YYYY-MM-DD
	dayNumber: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	sessions: Session[];
}

export interface SessionMonthTab {
	year: number;
	month: number; // 0-11
	label: string; // e.g. "Sep"
	yearShort: string; // e.g. "'26"
	fullLabel: string; // e.g. "Sep 2026"
	monthIndex: number;
	sessionCount: number;
	isCurrentMonth: boolean;
	isSelected: boolean;
}

export interface MonthCalendarGridProps {
	sessions: Session[];
	selectedDate: string; // YYYY-MM-DD
	onSelectDate: (dateStr: string) => void;
	onMonthChange?: (year: number, month: number) => void;
	sessionStartDate?: string;
	sessionEndDate?: string;
	sessionLabel?: string;
}

export const MonthCalendarGrid: React.FC<MonthCalendarGridProps> = ({
	sessions,
	selectedDate,
	onSelectDate,
	onMonthChange,
	sessionStartDate,
	sessionEndDate,
	sessionLabel,
}) => {
	const todayObj = useMemo(() => new Date(), []);
	const todayStr = useMemo(
		() => todayObj.toISOString().split("T")[0],
		[todayObj],
	);

	// Determine session boundaries
	const { startMonthIndex, endMonthIndex } = useMemo(() => {
		let sIdx: number;
		let eIdx: number;

		if (sessionStartDate && sessionEndDate) {
			const sParts = sessionStartDate.split("-").map(Number);
			const eParts = sessionEndDate.split("-").map(Number);
			sIdx = sParts[0] * 12 + (sParts[1] - 1);
			eIdx = eParts[0] * 12 + (eParts[1] - 1);
		} else {
			// Fallback: full current academic year (12 months)
			const curYear = todayObj.getFullYear();
			sIdx = curYear * 12;
			eIdx = curYear * 12 + 11;
		}

		if (sIdx > eIdx) {
			const temp = sIdx;
			sIdx = eIdx;
			eIdx = temp;
		}

		return { startMonthIndex: sIdx, endMonthIndex: eIdx };
	}, [sessionStartDate, sessionEndDate, todayObj]);

	// Current view month/year state
	const [viewYear, setViewYear] = useState<number>(() => {
		if (selectedDate) {
			const y = parseInt(selectedDate.split("-")[0], 10);
			if (!isNaN(y)) return y;
		}
		return todayObj.getFullYear();
	});
	const [viewMonth, setViewMonth] = useState<number>(() => {
		if (selectedDate) {
			const m = parseInt(selectedDate.split("-")[1], 10);
			if (!isNaN(m)) return m - 1;
		}
		return todayObj.getMonth();
	});

	const monthScrollRef = useRef<ScrollView>(null);

	const currentMonthIndex = viewYear * 12 + viewMonth;
	const canGoPrev = currentMonthIndex > startMonthIndex;
	const canGoNext = currentMonthIndex < endMonthIndex;

	// Month navigation logic
	const navigateToMonth = useCallback(
		(newY: number, newM: number) => {
			const newMonthIndex = newY * 12 + newM;
			if (newMonthIndex < startMonthIndex || newMonthIndex > endMonthIndex) {
				return;
			}
			setViewYear(newY);
			setViewMonth(newM);
			onMonthChange?.(newY, newM);

			// Check if current selectedDate is in new month
			const targetPrefix = `${newY}-${String(newM + 1).padStart(2, "0")}`;
			if (!selectedDate.startsWith(targetPrefix)) {
				if (todayStr.startsWith(targetPrefix)) {
					onSelectDate(todayStr);
				} else {
					// Find first session in this month if exists
					const firstInMonth = sessions.find((s) =>
						s.date.startsWith(targetPrefix),
					);
					if (firstInMonth) {
						onSelectDate(firstInMonth.date);
					} else {
						onSelectDate(`${targetPrefix}-01`);
					}
				}
			}
		},
		[
			startMonthIndex,
			endMonthIndex,
			onMonthChange,
			selectedDate,
			todayStr,
			sessions,
			onSelectDate,
		],
	);

	const handlePrevMonth = () => {
		if (!canGoPrev) return;
		let newM = viewMonth - 1;
		let newY = viewYear;
		if (newM < 0) {
			newM = 11;
			newY -= 1;
		}
		navigateToMonth(newY, newM);
	};

	const handleNextMonth = () => {
		if (!canGoNext) return;
		let newM = viewMonth + 1;
		let newY = viewYear;
		if (newM > 11) {
			newM = 0;
			newY += 1;
		}
		navigateToMonth(newY, newM);
	};

	// Sync state if selectedDate was changed externally (e.g. Next/Prev day button)
	useEffect(() => {
		if (!selectedDate) return;
		const parts = selectedDate.split("-").map(Number);
		if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
			const selY = parts[0];
			const selM = parts[1] - 1;
			if (selY !== viewYear || selM !== viewMonth) {
				setViewYear(selY);
				setViewMonth(selM);
			}
		}
	}, [selectedDate]);

	// Adjust if session boundaries change externally
	useEffect(() => {
		if (!sessionStartDate || !sessionEndDate) return;
		const curIdx = viewYear * 12 + viewMonth;
		if (curIdx < startMonthIndex || curIdx > endMonthIndex) {
			const parts = sessionStartDate.split("-").map(Number);
			if (parts.length >= 2) {
				setViewYear(parts[0]);
				setViewMonth(parts[1] - 1);
			}
		}
	}, [
		sessionStartDate,
		sessionEndDate,
		startMonthIndex,
		endMonthIndex,
		viewYear,
		viewMonth,
	]);

	// Pre-index sessions by date for fast lookup
	const sessionsByDate = useMemo(() => {
		const map: Record<string, Session[]> = {};
		sessions.forEach((s) => {
			if (!map[s.date]) map[s.date] = [];
			map[s.date].push(s);
		});
		return map;
	}, [sessions]);

	// Compute month tabs for all months in the session
	const sessionMonths = useMemo<SessionMonthTab[]>(() => {
		const list: SessionMonthTab[] = [];
		for (let idx = startMonthIndex; idx <= endMonthIndex; idx++) {
			const y = Math.floor(idx / 12);
			const m = idx % 12;
			const mPrefix = `${y}-${String(m + 1).padStart(2, "0")}`;
			const count = sessions.filter((s) => s.date.startsWith(mPrefix)).length;

			list.push({
				year: y,
				month: m,
				label: MONTH_NAMES[m].substring(0, 3),
				yearShort: `'${String(y).substring(2)}`,
				fullLabel: `${MONTH_NAMES[m]} ${y}`,
				monthIndex: idx,
				sessionCount: count,
				isCurrentMonth:
					y === todayObj.getFullYear() && m === todayObj.getMonth(),
				isSelected: y === viewYear && m === viewMonth,
			});
		}
		return list;
	}, [startMonthIndex, endMonthIndex, sessions, viewYear, viewMonth, todayObj]);

	// Auto scroll horizontal month strip when viewYear/viewMonth changes
	useEffect(() => {
		if (!monthScrollRef.current) return;
		const activeIdx = sessionMonths.findIndex(
			(m) => m.year === viewYear && m.month === viewMonth,
		);
		if (activeIdx >= 0) {
			monthScrollRef.current.scrollTo({
				x: Math.max(0, activeIdx * 68 - 60),
				animated: true,
			});
		}
	}, [viewYear, viewMonth, sessionMonths]);

	// PanResponder for horizontal swipe gesture to change months
	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return Math.abs(gestureState.dx) > 25 && Math.abs(gestureState.dy) < 30;
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dx < -50) {
					handleNextMonth();
				} else if (gestureState.dx > 50) {
					handlePrevMonth();
				}
			},
		}),
	).current;

	// Compute 7-column grid layout for current view month
	const gridCells = useMemo<DayGridCell[]>(() => {
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

		// First day of month: Mon=0, Tue=1, ..., Sun=6
		let firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
		firstDayIndex = (firstDayIndex + 6) % 7;

		const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
		const cells: DayGridCell[] = [];

		// Previous month padding cells
		for (let i = firstDayIndex - 1; i >= 0; i--) {
			const dayNum = prevMonthDays - i;
			const pMonth = viewMonth === 0 ? 11 : viewMonth - 1;
			const pYear = viewMonth === 0 ? viewYear - 1 : viewYear;
			const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
			cells.push({
				dateStr,
				dayNumber: dayNum,
				isCurrentMonth: false,
				isToday: dateStr === todayStr,
				sessions: sessionsByDate[dateStr] || [],
			});
		}

		// Current month cells
		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			cells.push({
				dateStr,
				dayNumber: day,
				isCurrentMonth: true,
				isToday: dateStr === todayStr,
				sessions: sessionsByDate[dateStr] || [],
			});
		}

		// Next month padding cells to fill remaining row(s) to multiple of 7
		const remaining = (7 - (cells.length % 7)) % 7;
		for (let day = 1; day <= remaining; day++) {
			const nMonth = viewMonth === 11 ? 0 : viewMonth + 1;
			const nYear = viewMonth === 11 ? viewYear + 1 : viewYear;
			const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			cells.push({
				dateStr,
				dayNumber: day,
				isCurrentMonth: false,
				isToday: dateStr === todayStr,
				sessions: sessionsByDate[dateStr] || [],
			});
		}

		return cells;
	}, [viewYear, viewMonth, sessionsByDate, todayStr]);

	const handleCellPress = (cell: DayGridCell) => {
		if (!cell.isCurrentMonth) {
			const parts = cell.dateStr.split("-").map(Number);
			const cIndex = parts[0] * 12 + (parts[1] - 1);
			if (cIndex >= startMonthIndex && cIndex <= endMonthIndex) {
				setViewYear(parts[0]);
				setViewMonth(parts[1] - 1);
				onMonthChange?.(parts[0], parts[1] - 1);
			}
		}
		onSelectDate(cell.dateStr);
	};

	return (
		<View style={styles.container}>
			{/* Month Header Navigation */}
			<View style={styles.headerRow}>
				<Pressable
					onPress={handlePrevMonth}
					disabled={!canGoPrev}
					style={({ pressed }) => [
						styles.arrowBtn,
						!canGoPrev && styles.arrowDisabled,
						pressed && canGoPrev && styles.arrowPressed,
					]}
					hitSlop={12}
				>
					<ChevronLeft
						size={20}
						color={canGoPrev ? colors.textMain : colors.textMuted}
					/>
				</Pressable>

				<View style={styles.titleWrapper}>
					<Text style={styles.monthTitle}>
						{MONTH_NAMES[viewMonth]} {viewYear}
					</Text>
					{sessionLabel ? (
						<Text style={styles.sessionSubtitle}>{sessionLabel}</Text>
					) : null}
				</View>

				<Pressable
					onPress={handleNextMonth}
					disabled={!canGoNext}
					style={({ pressed }) => [
						styles.arrowBtn,
						!canGoNext && styles.arrowDisabled,
						pressed && canGoNext && styles.arrowPressed,
					]}
					hitSlop={12}
				>
					<ChevronRight
						size={20}
						color={canGoNext ? colors.textMain : colors.textMuted}
					/>
				</Pressable>
			</View>

			{/* Horizontal Month Strip of the Session */}
			<View style={styles.monthStripWrapper}>
				<ScrollView
					ref={monthScrollRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.monthTabsScrollContent}
				>
					{sessionMonths.map((item) => (
						<Pressable
							key={`${item.year}-${item.month}`}
							onPress={() => navigateToMonth(item.year, item.month)}
							style={({ pressed }) => [
								styles.monthTab,
								item.isSelected && styles.monthTabSelected,
								pressed && styles.monthTabPressed,
							]}
						>
							<Text
								style={[
									styles.monthTabText,
									item.isSelected && styles.monthTabTextSelected,
									item.isCurrentMonth &&
										!item.isSelected &&
										styles.monthTabTextCurrent,
								]}
							>
								{item.label}
							</Text>
							<Text
								style={[
									styles.monthTabYearText,
									item.isSelected && styles.monthTabYearTextSelected,
								]}
							>
								{item.yearShort}
							</Text>
							{item.sessionCount > 0 ? (
								<View
									style={[
										styles.monthDot,
										item.isSelected && styles.monthDotSelected,
									]}
								/>
							) : (
								<View style={styles.monthDotPlaceholder} />
							)}
						</Pressable>
					))}
				</ScrollView>
			</View>

			{/* Weekday Labels (Mon - Sun) */}
			<View style={styles.weekdayRow}>
				{WEEKDAY_LABELS.map((day) => (
					<View key={day} style={styles.weekdayCell}>
						<Text style={styles.weekdayText}>{day}</Text>
					</View>
				))}
			</View>

			{/* Days Grid with horizontal swipe gesture support */}
			<View style={styles.grid} {...panResponder.panHandlers}>
				{gridCells.map((cell) => {
					const isSelected = cell.dateStr === selectedDate;
					const displaySessions = cell.sessions.slice(0, 3); // Max 3 dots

					return (
						<Pressable
							key={cell.dateStr}
							onPress={() => handleCellPress(cell)}
							style={({ pressed }) => [
								styles.dayCell,
								!cell.isCurrentMonth && styles.dayCellOutside,
								isSelected && styles.dayCellSelected,
								pressed && styles.dayCellPressed,
							]}
						>
							{/* Day Number */}
							<View
								style={[
									styles.dayNumWrapper,
									cell.isToday && !isSelected && styles.todayNumWrapper,
								]}
							>
								<Text
									style={[
										styles.dayNumText,
										!cell.isCurrentMonth && styles.dayNumTextOutside,
										cell.isToday && !isSelected && styles.todayNumText,
										isSelected && styles.selectedNumText,
									]}
								>
									{cell.dayNumber}
								</Text>
							</View>

							{/* Status Dots (Max 3) */}
							<View style={styles.dotsRow}>
								{displaySessions.map((s, idx) => (
									<View
										key={`${s.id}-${idx}`}
										style={[
											styles.dot,
											{ backgroundColor: getSessionDotColor(s) },
										]}
									/>
								))}
							</View>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		marginBottom: 16,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	titleWrapper: {
		alignItems: "center",
	},
	monthTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: colors.textMain,
	},
	sessionSubtitle: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.primary,
		marginTop: 1,
	},
	arrowBtn: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	arrowDisabled: {
		opacity: 0.3,
	},
	arrowPressed: {
		opacity: 0.7,
	},
	monthStripWrapper: {
		marginBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		paddingBottom: 10,
	},
	monthTabsScrollContent: {
		gap: 6,
		paddingHorizontal: 2,
	},
	monthTab: {
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		minWidth: 56,
	},
	monthTabSelected: {
		backgroundColor: "rgba(16, 185, 129, 0.12)",
		borderColor: colors.primary,
	},
	monthTabPressed: {
		opacity: 0.8,
	},
	monthTabText: {
		fontSize: 12,
		fontWeight: "700",
		color: colors.textMuted,
	},
	monthTabTextSelected: {
		color: colors.primary,
		fontWeight: "800",
	},
	monthTabTextCurrent: {
		color: colors.textMain,
	},
	monthTabYearText: {
		fontSize: 10,
		fontWeight: "500",
		color: colors.textSubtle,
		marginTop: 1,
	},
	monthTabYearTextSelected: {
		color: colors.primary,
		fontWeight: "600",
	},
	monthDot: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.primary,
		marginTop: 4,
	},
	monthDotSelected: {
		backgroundColor: colors.primary,
		width: 6,
		height: 4,
		borderRadius: 2,
	},
	monthDotPlaceholder: {
		width: 4,
		height: 4,
		marginTop: 4,
	},
	weekdayRow: {
		flexDirection: "row",
		marginBottom: 8,
	},
	weekdayCell: {
		flex: 1,
		alignItems: "center",
	},
	weekdayText: {
		fontSize: 11,
		fontWeight: "700",
		color: colors.textSubtle,
		textTransform: "uppercase",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	dayCell: {
		width: "14.28%", // 7 columns
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 12,
		marginVertical: 2,
		paddingVertical: 2,
	},
	dayCellOutside: {
		opacity: 0.35,
	},
	dayCellSelected: {
		backgroundColor: "rgba(16,185,129,0.18)",
		borderWidth: 1.5,
		borderColor: colors.primary,
	},
	dayCellPressed: {
		opacity: 0.8,
	},
	dayNumWrapper: {
		width: 26,
		height: 26,
		borderRadius: 13,
		alignItems: "center",
		justifyContent: "center",
	},
	todayNumWrapper: {
		backgroundColor: colors.primary,
		borderRadius: 8,
	},
	dayNumText: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.textMain,
	},
	dayNumTextOutside: {
		color: colors.textMuted,
	},
	todayNumText: {
		color: "#ffffff",
		fontWeight: "700",
	},
	selectedNumText: {
		color: colors.primary,
		fontWeight: "700",
	},
	dotsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 3,
		marginTop: 2,
		height: 6,
	},
	dot: {
		width: 5,
		height: 5,
		borderRadius: 2.5,
	},
});
