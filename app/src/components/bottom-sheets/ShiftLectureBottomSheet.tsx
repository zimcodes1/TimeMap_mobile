import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	TextInput,
	ScrollView,
	Pressable,
	ActivityIndicator,
} from "react-native";
import {
	Calendar,
	Clock,
	MapPin,
	Check,
	AlertCircle,
	Repeat,
	CalendarClock,
	Wifi,
} from "lucide-react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/common/Text";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Session } from "@/types";
import { useVenues, useVenueAvailability } from "@/hooks/useShiftLecture";
import { VenueSlot } from "@/api/venuesAPI";

// ─── Props & Helpers ──────────────────────────────────────────────────────────

export interface WeekdayItem {
	code: 'MO' | 'TU' | 'WE' | 'TH' | 'FR';
	name: string;
	label: string;
	date: string;
}

export function computeWeekdaysForSession(
	sessionDateStr?: string,
	isRecurring: boolean = false,
): WeekdayItem[] {
	const ref = sessionDateStr
		? new Date(sessionDateStr + 'T00:00:00')
		: new Date();
	const currentDay = ref.getDay(); // 0 is Sun, 1 is Mon, 5 is Fri
	const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
	const monday = new Date(ref);
	monday.setDate(ref.getDate() + distanceToMonday);

	const today = new Date();
	const yyyyT = today.getFullYear();
	const mmT = String(today.getMonth() + 1).padStart(2, '0');
	const ddT = String(today.getDate()).padStart(2, '0');
	const todayStr = `${yyyyT}-${mmT}-${ddT}`;

	const DAYS: Array<{ code: 'MO' | 'TU' | 'WE' | 'TH' | 'FR'; name: string }> = [
		{ code: 'MO', name: 'Monday' },
		{ code: 'TU', name: 'Tuesday' },
		{ code: 'WE', name: 'Wednesday' },
		{ code: 'TH', name: 'Thursday' },
		{ code: 'FR', name: 'Friday' },
	];

	const allWeekdays = DAYS.map((d, index) => {
		const dayDate = new Date(monday);
		dayDate.setDate(monday.getDate() + index);
		const yyyy = dayDate.getFullYear();
		const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
		const dd = String(dayDate.getDate()).padStart(2, '0');
		return {
			code: d.code,
			name: d.name,
			label: isRecurring ? d.name : `${d.name} (This week)`,
			date: `${yyyy}-${mm}-${dd}`,
		};
	});

	if (isRecurring) {
		return allWeekdays;
	}

	// Filter out past weekdays: only show today or future days
	const futureOrToday = allWeekdays.filter((d) => d.date >= todayStr);
	return futureOrToday.length > 0
		? futureOrToday
		: [allWeekdays[allWeekdays.length - 1]];
}

export interface ShiftLectureBottomSheetProps {
	visible: boolean;
	onClose: () => void;
	session: Session | null;
	onSubmitShift: (params: {
		isRecurring: boolean;
		venueId: string;
		venueName: string;
		date: string;
		weekday?: string;
		startTime: string;
		endTime: string;
		reason: string;
	}) => void;
	isSubmitting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ShiftLectureBottomSheet: React.FC<
	ShiftLectureBottomSheetProps
> = ({ visible, onClose, session, onSubmitShift, isSubmitting = false }) => {
	// Mode: single instance vs recurrent pattern
	const [isRecurring, setIsRecurring] = useState(false);

	// Weekday options for the session's active week
	const weekdays = React.useMemo(() => {
		return computeWeekdaysForSession(session?.date, isRecurring);
	}, [session?.date, isRecurring]);

	// Selected weekday code (defaults to current session's weekday if valid/future)
	const [selectedDayCode, setSelectedDayCode] = useState<
		'MO' | 'TU' | 'WE' | 'TH' | 'FR'
	>('MO');

	const selectedWeekday =
		weekdays.find((w) => w.code === selectedDayCode) || weekdays[0];

	// Selected venue
	const [selectedVenueId, setSelectedVenueId] = useState("");
	const [selectedVenueName, setSelectedVenueName] = useState("");

	// Selected slot
	const [selectedSlot, setSelectedSlot] = useState<VenueSlot | null>(null);

	// Reason
	const [reason, setReason] = useState("");

	// Course param for scoped venues (ID or code)
	const courseParam = session?.course?.id || session?.course?.code;

	// Real-time venues query
	const {
		data: venues = [],
		isLoading: isLoadingVenues,
		isError: isVenuesError,
		refetch: refetchVenues,
	} = useVenues(visible && courseParam ? courseParam : undefined);

	// Fallback: make sure the session's current venue is always present in the selection list
	const displayVenues = React.useMemo(() => {
		if (!session?.venue?.id) return venues;
		const exists = venues.some(
			(v) => String(v.id) === String(session.venue.id),
		);
		if (!exists && session.venue.id) {
			return [
				{
					id: String(session.venue.id),
					name: session.venue.name || "Current Venue",
					venueType: "lecture_hall",
					capacity: session.venue.capacity || 0,
					isActive: true,
				},
				...venues,
			];
		}
		return venues;
	}, [venues, session?.venue]);

	// Real-time venue availability query
	const {
		data: availability,
		isLoading: isLoadingAvailability,
		isError: isAvailabilityError,
		refetch: refetchAvailability,
	} = useVenueAvailability(
		visible && selectedVenueId ? selectedVenueId : undefined,
		visible && selectedWeekday
			? { date: selectedWeekday.date, weekday: selectedWeekday.name }
			: undefined,
		session?.id,
	);

	// Initialize/reset form state on open with current session's weekday auto-selected (if future)
	useEffect(() => {
		if (visible && session) {
			setIsRecurring(false);
			const sessionDate = session.date
				? new Date(session.date + "T00:00:00")
				: new Date();
			const dayNum = sessionDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
			const codeMap: Record<number, "MO" | "TU" | "WE" | "TH" | "FR"> = {
				1: "MO",
				2: "TU",
				3: "WE",
				4: "TH",
				5: "FR",
			};
			const initialCode = codeMap[dayNum] || "MO";
			const available = computeWeekdaysForSession(session.date, false);
			const hasInitial = available.some((w) => w.code === initialCode);
			setSelectedDayCode(
				hasInitial ? initialCode : available[0]?.code || "MO",
			);
			setSelectedVenueId(String(session.venue.id || ""));
			setSelectedVenueName(session.venue.name || "");
			setSelectedSlot(null);
			setReason("");
		}
	}, [visible, session]);

	// Keep selectedDayCode aligned when weekdays change (e.g. toggling isRecurring)
	useEffect(() => {
		if (
			weekdays.length > 0 &&
			!weekdays.some((w) => w.code === selectedDayCode)
		) {
			setSelectedDayCode(weekdays[0].code);
		}
	}, [weekdays, selectedDayCode]);

	// If initial venue is loaded, make sure venue name is in sync
	useEffect(() => {
		if (displayVenues.length > 0 && selectedVenueId) {
			const found = displayVenues.find(
				(v) => String(v.id) === String(selectedVenueId),
			);
			if (found) {
				setSelectedVenueName(found.name);
			}
		}
	}, [displayVenues, selectedVenueId]);

	const slots = availability?.slots ?? [];

	// Validation
	const hasTimeSelected = Boolean(selectedSlot?.start && selectedSlot?.end);
	const hasVenueSelected = Boolean(selectedVenueId);
	const hasReasonIfRequired = !isRecurring || reason.trim().length >= 5;
	const canSubmit =
		!isSubmitting && hasVenueSelected && hasTimeSelected && hasReasonIfRequired;

	const handleSubmit = () => {
		if (!canSubmit || !selectedSlot) return;
		onSubmitShift({
			isRecurring,
			venueId: selectedVenueId,
			venueName: selectedVenueName,
			date: selectedWeekday.date,
			weekday: selectedWeekday.name,
			startTime: selectedSlot.start.substring(0, 5),
			endTime: selectedSlot.end.substring(0, 5),
			reason: reason.trim(),
		});
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={onClose}
			title="Shift Lecture"
			subtitle={
				session ? `${session.course.code} · ${session.course.title}` : undefined
			}
		>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={styles.scrollContent}
			>
				{/* Recurrence Mode Selector */}
				<View style={styles.modeContainer}>
					<Pressable
						style={[styles.modeTab, !isRecurring && styles.modeTabActive]}
						onPress={() => setIsRecurring(false)}
					>
						<CalendarClock
							size={16}
							color={!isRecurring ? colors.primary : colors.textSubtle}
						/>
						<Text
							style={[
								styles.modeTabText,
								!isRecurring && styles.modeTabTextActive,
							]}
						>
							This Session Only
						</Text>
					</Pressable>

					<Pressable
						style={[styles.modeTab, isRecurring && styles.modeTabActive]}
						onPress={() => setIsRecurring(true)}
					>
						<Repeat
							size={16}
							color={isRecurring ? colors.primary : colors.textSubtle}
						/>
						<Text
							style={[
								styles.modeTabText,
								isRecurring && styles.modeTabTextActive,
							]}
						>
							Recurring Change
						</Text>
					</Pressable>
				</View>

				{isRecurring ? (
					<View style={styles.infoBanner}>
						<AlertCircle size={15} color={colors.warning} />
						<Text style={styles.infoBannerText}>
							A recurring change submits a discrepancy request for Admin
							approval before updating all future sessions.
						</Text>
					</View>
				) : null}

				{/* Live Network Notice */}
				<View style={styles.networkBadgeRow}>
					<Wifi size={13} color={colors.primary} />
					<Text style={styles.networkBadgeText}>
						Realtime verification active
					</Text>
				</View>

				{/* Weekday Selector */}
				<View style={styles.section}>
					<Text style={styles.fieldLabel}>Select Weekday</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.weekdayRow}
					>
						{weekdays.map((day) => {
							const isSelected = day.code === selectedDayCode;
							return (
								<Pressable
									key={day.code}
									style={[
										styles.weekdayPill,
										isSelected && styles.weekdayPillActive,
									]}
									onPress={() => {
										setSelectedDayCode(day.code);
										setSelectedSlot(null);
									}}
								>
									<Calendar
										size={14}
										color={isSelected ? colors.primary : colors.textSubtle}
									/>
									<Text
										style={[
											styles.weekdayPillText,
											isSelected && styles.weekdayPillTextActive,
										]}
									>
										{day.label}
									</Text>
								</Pressable>
							);
						})}
					</ScrollView>
				</View>

				{/* Venue Selector */}
				<View style={styles.section}>
					<View style={styles.labelRow}>
						<Text style={styles.fieldLabel}>Select Venue (Course Scope)</Text>
						{isLoadingVenues ? (
							<ActivityIndicator size="small" color={colors.primary} />
						) : null}
					</View>

					{isVenuesError ? (
						<Pressable onPress={() => refetchVenues()} style={styles.retryBox}>
							<Text style={styles.retryText}>
								Could not load venues. Tap to retry.
							</Text>
						</Pressable>
					) : null}

					{isLoadingVenues && displayVenues.length === 0 ? (
						<View style={styles.loadingVenuesBox}>
							<Text style={styles.loadingVenuesText}>
								Loading allowed venues...
							</Text>
						</View>
					) : displayVenues.length === 0 ? (
						<View style={styles.emptyVenuesBox}>
							<Text style={styles.emptyVenuesText}>
								No venues found for this course scope.
							</Text>
						</View>
					) : (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.venueRow}
						>
							{displayVenues.map((venue) => {
								const isSelected = String(venue.id) === String(selectedVenueId);
								return (
									<Pressable
										key={venue.id}
										style={[
											styles.venuePill,
											isSelected && styles.venuePillActive,
										]}
										onPress={() => {
											setSelectedVenueId(String(venue.id));
											setSelectedVenueName(venue.name);
											setSelectedSlot(null);
										}}
									>
										<MapPin
											size={14}
											color={isSelected ? colors.primary : colors.textSubtle}
										/>
										<Text
											style={[
												styles.venuePillText,
												isSelected && styles.venuePillTextActive,
											]}
										>
											{venue.name}
										</Text>
										{venue.capacity ? (
											<Text
												style={[
													styles.venueCapText,
													isSelected && styles.venueCapTextActive,
												]}
											>
												({venue.capacity})
											</Text>
										) : null}
									</Pressable>
								);
							})}
						</ScrollView>
					)}
				</View>

				{/* Available Time Slots */}
				<View style={styles.section}>
					<View style={styles.labelRow}>
						<Text style={styles.fieldLabel}>Available Time Slots</Text>
						{isLoadingAvailability ? (
							<ActivityIndicator size="small" color={colors.primary} />
						) : null}
					</View>

					{isAvailabilityError ? (
						<Pressable
							onPress={() => refetchAvailability()}
							style={styles.retryBox}
						>
							<Text style={styles.retryText}>
								Could not verify slots. Tap to retry.
							</Text>
						</Pressable>
					) : null}

					{isLoadingAvailability ? (
						<View style={styles.slotsLoading}>
							<ActivityIndicator size="small" color={colors.primary} />
							<Text style={styles.slotsLoadingText}>
								Checking live venue availability…
							</Text>
						</View>
					) : slots.length === 0 ? (
						<View style={styles.emptySlots}>
							<AlertCircle size={16} color={colors.textSubtle} />
							<Text style={styles.emptySlotsText}>
								No available standard slots for this venue on {selectedWeekday.name}. Try another
								venue or weekday.
							</Text>
						</View>
					) : (
						<View style={styles.slotsGrid}>
							{slots.map((slot, index) => {
								const isSelected =
									selectedSlot?.start === slot.start &&
									selectedSlot?.end === slot.end;
								return (
									<Pressable
										key={`slot-${index}`}
										style={[
											styles.slotCard,
											isSelected && styles.slotCardActive,
										]}
										onPress={() => setSelectedSlot(slot)}
									>
										<View style={styles.slotHeader}>
											<Clock
												size={14}
												color={isSelected ? colors.primary : colors.textSubtle}
											/>
											<Text
												style={[
													styles.slotLabel,
													isSelected && styles.slotLabelActive,
												]}
											>
												{slot.label}
											</Text>
										</View>
										{isSelected ? (
											<Check size={16} color={colors.primary} />
										) : null}
									</Pressable>
								);
							})}
						</View>
					)}

					<Text style={styles.operatingHint}>
						Standard 2-hour university slots (8:00 AM – 6:00 PM{selectedDayCode === 'FR' ? ' · Friday 12-2 PM Jummat prayer excluded' : ''})
					</Text>
				</View>

				{/* Reason / Notes */}
				<View style={styles.section}>
					<View style={styles.labelRow}>
						<Text style={styles.fieldLabel}>
							{isRecurring ? "Reason for Recurrent Shift" : "Reason / Notes"}
						</Text>
						{isRecurring ? (
							<Text style={styles.requiredBadge}>Required</Text>
						) : (
							<Text style={styles.optionalBadge}>Optional</Text>
						)}
					</View>

					<TextInput
						style={styles.textarea}
						value={reason}
						onChangeText={setReason}
						placeholder={
							isRecurring
								? "Explain why this recurring lecture schedule needs to change (required for admin approval)…"
								: "Optional notes regarding this shift…"
						}
						placeholderTextColor={colors.textSubtle}
						multiline
						numberOfLines={3}
						textAlignVertical="top"
						editable={!isSubmitting}
					/>
					{isRecurring &&
					reason.trim().length > 0 &&
					reason.trim().length < 5 ? (
						<Text style={styles.errorText}>
							Reason must be at least 5 characters.
						</Text>
					) : null}
				</View>

				{/* Actions */}
				<View style={styles.actions}>
					<Button
						variant="primary"
						size="lg"
						onPress={handleSubmit}
						disabled={!canSubmit}
						isLoading={isSubmitting}
					>
						{isRecurring ? "Submit for Admin Approval" : "Confirm Shift"}
					</Button>
					<Button
						variant="ghost"
						size="md"
						onPress={onClose}
						style={styles.cancelBtn}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</View>
			</ScrollView>
		</BottomSheet>
	);
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	scrollView: {
		flexShrink: 1,
	},
	scrollContent: {
		paddingBottom: 48,
	},
	modeContainer: {
		flexDirection: "row",
		backgroundColor: colors.surfaceRaised,
		borderRadius: 12,
		padding: 4,
		marginBottom: 12,
	},
	modeTab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 10,
		borderRadius: 8,
	},
	modeTabActive: {
		backgroundColor: colors.surface,
	},
	modeTabText: {
		fontSize: 13,
		color: colors.textSubtle,
		fontWeight: "500",
	},
	modeTabTextActive: {
		color: colors.textMain,
		fontWeight: "600",
	},
	infoBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: `${colors.warning}15`,
		borderRadius: 8,
		padding: 10,
		marginBottom: 12,
	},
	infoBannerText: {
		flex: 1,
		fontSize: 12,
		color: colors.warning,
		lineHeight: 16,
	},
	networkBadgeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 14,
	},
	networkBadgeText: {
		fontSize: 12,
		color: colors.primary,
		fontWeight: "500",
	},
	section: {
		marginBottom: 16,
	},
	labelRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	fieldLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.textMain,
		marginBottom: 6,
	},
	requiredBadge: {
		fontSize: 11,
		color: colors.danger,
		fontWeight: "500",
	},
	optionalBadge: {
		fontSize: 11,
		color: colors.textSubtle,
	},
	weekdayRow: {
		gap: 8,
		paddingVertical: 4,
	},
	weekdayPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	weekdayPillActive: {
		borderColor: colors.primary,
		backgroundColor: `${colors.primary}15`,
	},
	weekdayPillText: {
		fontSize: 13,
		color: colors.textMuted,
		fontWeight: "500",
	},
	weekdayPillTextActive: {
		color: colors.primary,
		fontWeight: "600",
	},
	venueRow: {
		gap: 8,
		paddingVertical: 4,
	},
	venuePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	venuePillActive: {
		borderColor: colors.primary,
		backgroundColor: `${colors.primary}15`,
	},
	venuePillText: {
		fontSize: 13,
		color: colors.textMuted,
		fontWeight: "500",
	},
	venuePillTextActive: {
		color: colors.primary,
		fontWeight: "600",
	},
	venueCapText: {
		fontSize: 11,
		color: colors.textSubtle,
	},
	venueCapTextActive: {
		color: colors.primary,
	},
	loadingVenuesBox: {
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
		alignItems: "center",
		marginVertical: 4,
	},
	loadingVenuesText: {
		fontSize: 12,
		color: colors.textSubtle,
	},
	emptyVenuesBox: {
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
		marginVertical: 4,
	},
	emptyVenuesText: {
		fontSize: 12,
		color: colors.textSubtle,
	},
	slotsLoading: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
	},
	slotsLoadingText: {
		fontSize: 13,
		color: colors.textSubtle,
	},
	emptySlots: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
	},
	emptySlotsText: {
		flex: 1,
		fontSize: 12,
		color: colors.textSubtle,
	},
	slotsGrid: {
		gap: 8,
	},
	slotCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	slotCardActive: {
		borderColor: colors.primary,
		backgroundColor: `${colors.primary}15`,
	},
	slotHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	slotLabel: {
		fontSize: 13,
		color: colors.textMain,
		fontWeight: "500",
	},
	slotLabelActive: {
		color: colors.primary,
		fontWeight: "600",
	},
	operatingHint: {
		fontSize: 11,
		color: colors.textSubtle,
		marginTop: 6,
	},
	retryBox: {
		padding: 8,
		marginBottom: 8,
	},
	retryText: {
		fontSize: 12,
		color: colors.primary,
	},
	textarea: {
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 12,
		color: colors.textMain,
		fontSize: 13,
		minHeight: 70,
	},
	errorText: {
		fontSize: 11,
		color: colors.danger,
		marginTop: 4,
	},
	actions: {
		gap: 8,
		marginTop: 8,
	},
	cancelBtn: {
		marginTop: 2,
	},
});
