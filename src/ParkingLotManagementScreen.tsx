import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { sendRequest } from './sendApiRequest';
import {
  END_MAINTENANCE_API,
  MAINTENANCE_API,
  PARK_API,
  SLOTS_API,
  STATISTICS_API,
  UNPARK_API,
} from './apiEndPoints';

// Interfaces
interface ApiResponse {
  message: string;
  parkingFee?: number;
  parkingLot?: any; // Adjust the type based on your actual response structure
}

interface Slot {
  _id: string;
  slotNumber: number;
  status: 'empty' | 'booked';
  inMaintenance: boolean;
}

interface SlotItemProps {
  slot: Slot;
  onPress: (slotId: string) => void;
}

// Dummy Slots data
const dummySlots: Slot[] = [
  { _id: '1', slotNumber: 1, status: 'empty', inMaintenance: true },
  { _id: '2', slotNumber: 2, status: 'booked', inMaintenance: false },
  { _id: '3', slotNumber: 3, status: 'empty', inMaintenance: true },
  { _id: '4', slotNumber: 4, status: 'empty', inMaintenance: false },
  { _id: '5', slotNumber: 5, status: 'empty', inMaintenance: false },
  { _id: '6', slotNumber: 6, status: 'booked', inMaintenance: true },
  { _id: '7', slotNumber: 7, status: 'empty', inMaintenance: false },
  { _id: '8', slotNumber: 8, status: 'booked', inMaintenance: false },
  { _id: '9', slotNumber: 9, status: 'empty', inMaintenance: false },
  { _id: '10', slotNumber: 10, status: 'booked', inMaintenance: true },
];

// Component
const ParkingLotManagementScreen: React.FC = () => {
  // State variables
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [slots, setSlots] = useState<Slot[]>(dummySlots);
  const itemData = useRef<Slot>()
  // Component lifecycle hooks
  useEffect(() => {
    getAllSlots();
  }, []);

  // API call to fetch all slots
  const getAllSlots = async () => {
    try {
      const data = await sendRequest(SLOTS_API, 'GET');
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Input validation
  const validateInput = () => {
    if (!vehicleNumber.trim()) {
      setInputError('Please enter a valid vehicle number');
      return false;
    }
    setInputError(null);
    return true;
  };

  // Clear input and error
  const clearInputAndError = () => {
    setVehicleNumber('');
    setInputError(null);
  };

  // Handle API call with input validation
  const handleApiCall = async (apiFunction: () => Promise<void>, withoutValidate?: boolean) => {
    try {
      if (withoutValidate || validateInput()) {
        setLoading(true);
        setResponseMessage('');
        await apiFunction();
      } else {
        Alert.alert('Email is invalid');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for slot press
  const handleSlotPress = async (item: Slot) => {
    try{
      itemData.current = item;
      console.log(itemData, 'itemDataitemDataitemData');
      
      if (!itemData.current.inMaintenance) {
        await handleApiCall(putSlotIntoMaintenance, true);
      } else {
        await handleApiCall(bringSlotBackToWorkingState,  true);
      }
    } catch(err){
      console.log(err, 'errrorrrr');
    }
  };

  // API functions
  const parkVehicle = async (): Promise<void> => {
    try {
      const data: ApiResponse = await sendRequest(PARK_API, 'POST', { vehicleNumber });
      setResponseMessage(data.message);
      Alert.alert(data.message);
      clearInputAndError();
    } catch (error) {
      console.error('Error parking vehicle:', error);
      Alert.alert("Failed to Park the Vehicle");
      setResponseMessage('Failed to Park the Vehicle');
    }
  };

  const unparkVehicle = async (): Promise<void> => {
    try {
      const data: ApiResponse = await sendRequest(UNPARK_API, 'POST', { vehicleNumber });
      setResponseMessage(`${data.message} Parking Fee: Rs. ${data.parkingFee}`);
      Alert.alert(`${data.message} Parking Fee: Rs. ${data.parkingFee}`);

      clearInputAndError();
    } catch (error) {
      console.error('Error unparking vehicle:', error);
    }
  };

  const getParkingLotStatus = async (): Promise<void> => {
    try {
      const data: ApiResponse = await sendRequest(STATISTICS_API);
      setResponseMessage(JSON.stringify(data.parkingLot));
      Alert.alert(JSON.stringify(data.parkingLot))
      clearInputAndError();
    } catch (error) {
      console.error('Error getting parking lot status:', error);
    }
  };

  const putSlotIntoMaintenance = async (): Promise<void> => {
    try {
      console.log("here");
      
      const data: ApiResponse = await sendRequest(`${MAINTENANCE_API}/${itemData.current?._id}`, 'PUT');
      setResponseMessage(data.message);
      Alert.alert(JSON.stringify(data.message))

      clearInputAndError();
    } catch (error) {
      console.error('Error putting slot into maintenance mode:', error);
    }
  };

  const bringSlotBackToWorkingState = async (): Promise<void> => {
    try {
      const data: ApiResponse = await sendRequest(`${END_MAINTENANCE_API}/${itemData.current?._id}`, 'PUT');
      setResponseMessage(data.message);
      Alert.alert(JSON.stringify(data.message))
      clearInputAndError();
    } catch (error) {
      console.error('Error bringing slot back to working state:', error);
    }
  };

  // JSX
  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Parking Lot Application</Text>
        {responseMessage ? (
          <Text
            style={[
              styles.responseMessage,
              responseMessage.toLowerCase().includes('failed') && styles.errorMessage,
            ]}
          >
            {responseMessage}
          </Text>
        ) : null}
        <TextInput
          style={[styles.input, inputError && styles.inputError]}
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChangeText={(text) => {setVehicleNumber(text); setResponseMessage("")}}
        />
        {loading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => handleApiCall(parkVehicle)}
              style={[styles.button, styles.parkButton]}
            >
              <Text style={styles.buttonText}>Park</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleApiCall(unparkVehicle)}
              style={[styles.button, styles.unparkButton]}
            >
              <Text style={styles.buttonText}>Unpark</Text>
            </TouchableOpacity>
            <FlatList
            scrollEnabled={false}
              ListHeaderComponent={
                <View style={styles.slotsHeaderView}>
                  <Text style={styles.headerText}>All available Slots</Text>
                  <View style={styles.rowStyle}>
                    <Text style={styles.headingText}>Green:</Text>
                    <Text style={styles.subText}>Booked Slot</Text>
                  </View>
                  <View style={styles.rowStyle}>
                    <Text style={styles.headingText}>Yellow:</Text>
                    <Text style={styles.subText}>Available Slot</Text>
                  </View>
                  <View style={styles.rowStyle}>
                    <Text style={styles.headingText}>Red:</Text>
                    <Text style={styles.subText}>Slot is Under Maintenance</Text>
                  </View>
                </View>
              }
              data={slots}
              style={{ flexWrap: 'wrap', margin: 0, padding: 0 }}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <SlotItem slot={item} onPress={() => handleSlotPress(item)} />}
              numColumns={5} // Adjust based on your layout
            />
            
            
            <TouchableOpacity
              onPress={() => handleApiCall(getParkingLotStatus, true)}
              style={[styles.statuSButton, styles.statusButton]}
            >
              <Text style={styles.buttonText}>Status</Text>
            </TouchableOpacity>
           
          </View>
        )}
       
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: 'red',
  },
  button: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  statuSButton: {
    marginBottom: 10,
    padding: 15,
    top: -60,
    borderRadius: 5,
    alignItems: 'center',
  },
  parkButton: {
    backgroundColor: '#4caf50',
  },
  unparkButton: {
    backgroundColor: '#f44336',
  },
  statusButton: {
    backgroundColor: '#2196f3',
  },
  maintenanceButton: {
    backgroundColor: '#ff9800',
  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endMaintenanceButton: {
    backgroundColor: '#607d8b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  responseMessage: {
    borderWidth: 1,
    marginVertical: 30,
    padding: 20,
    fontSize: 16,
    borderColor: 'white',
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'green',
  },
  slotsHeaderView:{
    marginBottom: 20
  },
  errorMessage: {
    color: 'white',
    backgroundColor: '#f44336',
  },
  slotItem: {
    width: 50,
    height: 50,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  slotText: {
    color: 'black',
    fontWeight: 'bold',
  },
  subText:{

  },
  headingText:{
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerText: {
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 20,
    fontSize: 20,
  },
});

// SlotItem component
const SlotItem: React.FC<SlotItemProps> = ({ slot, onPress }) => {
  let slotColor = 'yellow';

  if (slot.status === 'booked') {
    slotColor = 'green';
  } else if (slot.inMaintenance) {
    slotColor = 'red';
  }

  return (
    <TouchableOpacity onPress={() => onPress(slot._id)}>
      <View style={[styles.slotItem, { backgroundColor: slotColor }]}>
        <Text style={styles.slotText}>{slot.slotNumber}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ParkingLotManagementScreen;
