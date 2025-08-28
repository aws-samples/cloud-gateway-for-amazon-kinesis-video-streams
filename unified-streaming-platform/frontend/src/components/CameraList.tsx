import { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Table,
  Button,
  SpaceBetween,
  Box,
  Badge,
  Modal,
  Alert,
  Pagination,
  TextFilter,
  CollectionPreferences,
  Link
} from '@cloudscape-design/components';
import { cameraAPI } from "../../config/api';

interface Camera {
  composite_key: string;
  camera_id: string;
  camera_name: string;
  make_model: string;
  installation_location: string;
  retention_hours: number;
  ml_model: string;
  test_status: 'tested' | 'not_tested';
  created_at: string;
  updated_at: string;
  owner: string;
  screen_capture_base64?: string;
}

const CameraList: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Camera[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCamera, setDeletingCamera] = useState<Camera | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [filteringText, setFilteringText] = useState('');
  const [preferences, setPreferences] = useState({
    pageSize: 10,
    visibleContent: ['camera_name', 'thumbnail', 'make_model', 'installation_location', 'test_status', 'created_at', 'actions']
  });

  const fetchCameras = async (pageToken?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use our centralized camera API with frames included
      const result = await cameraAPI.listCameras(preferences.pageSize, true); // true for include_frames
      
      if (result.cameras) {
        // Map the API response to match our Camera interface
        const mappedCameras = result.cameras.map(camera => ({
          ...camera,
          composite_key: camera.composite_key || `${camera.camera_id}#${camera.owner || 'unknown'}`,
          owner: camera.owner || 'unknown'
        }));
        setCameras(mappedCameras);
        setNextToken(result.nextToken);
      } else {
        setCameras([]);
        setNextToken(undefined);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch cameras');
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteCamera = async (camera: Camera) => {
    try {
      // Use our centralized camera API
      await cameraAPI.deleteCamera(camera.camera_id);

      // Refresh the camera list
      await fetchCameras();
      setDeleteModalVisible(false);
      setDeletingCamera(null);
      
    } catch (err) {
      console.error('Error deleting camera:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete camera');
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [preferences.pageSize]);

  const handlePageChange = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
    if (pageIndex > currentPageIndex && nextToken) {
      fetchCameras(nextToken);
    } else if (pageIndex === 1) {
      fetchCameras();
    }
  };

  const filteredCameras = cameras.filter(camera =>
    camera.camera_name.toLowerCase().includes(filteringText.toLowerCase()) ||
    camera.make_model.toLowerCase().includes(filteringText.toLowerCase()) ||
    camera.installation_location.toLowerCase().includes(filteringText.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTestStatusBadge = (status: string) => {
    return status === 'tested' ? 
      <Badge color="green">Tested</Badge> : 
      <Badge color="grey">Not Tested</Badge>;
  };

  const columnDefinitions = [
    {
      id: 'camera_name',
      header: 'Camera Name',
      cell: (camera: Camera) => (
        <Link href={`#camera-details/${camera.camera_id}`}>
          {camera.camera_name}
        </Link>
      ),
      sortingField: 'camera_name',
      isRowHeader: true
    },
    {
      id: 'thumbnail',
      header: 'Preview',
      cell: (camera: Camera) => (
        camera.screen_capture_base64 ? (
          <img 
            src={`data:image/jpeg;base64,${camera.screen_capture_base64}`}
            alt={`${camera.camera_name} preview`}
            style={{ 
              width: '80px', 
              height: '60px', 
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #e1e4e8'
            }}
          />
        ) : (
          <Box color="text-status-inactive" fontSize="body-s">
            No preview
          </Box>
        )
      )
    },
    {
      id: 'make_model',
      header: 'Make & Model',
      cell: (camera: Camera) => camera.make_model,
      sortingField: 'make_model'
    },
    {
      id: 'installation_location',
      header: 'Location',
      cell: (camera: Camera) => camera.installation_location,
      sortingField: 'installation_location'
    },
    {
      id: 'ml_model',
      header: 'ML Model',
      cell: (camera: Camera) => camera.ml_model,
      sortingField: 'ml_model'
    },
    {
      id: 'retention_hours',
      header: 'Retention (Hours)',
      cell: (camera: Camera) => camera.retention_hours.toString(),
      sortingField: 'retention_hours'
    },
    {
      id: 'test_status',
      header: 'Test Status',
      cell: (camera: Camera) => getTestStatusBadge(camera.test_status),
      sortingField: 'test_status'
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: (camera: Camera) => formatDate(camera.created_at),
      sortingField: 'created_at'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (camera: Camera) => (
        <SpaceBetween direction="horizontal" >
          <Button
            variant="normal"
            onClick={() => {
              // Navigate to edit camera
              window.location.hash = `edit-camera/${camera.camera_id}`;
            }}
          >
            Edit
          </Button>
          <Button
            variant="normal"
            onClick={() => {
              setDeletingCamera(camera);
              setDeleteModalVisible(true);
            }}
          >
            Delete
          </Button>
        </SpaceBetween>
      ),
      width: 140
    }
  ];

  return (
    <Container>
      <SpaceBetween >
        <Header
          variant="h1"
          description="Manage your registered cameras and their configurations"
          actions={
            <Button
              variant="primary"
              onClick={() => window.location.hash = 'add-camera'}
            >
              Add New Camera
            </Button>
          }
        >
          📹 My Cameras
        </Header>

        {error && (
          <Alert
            statusIconAriaLabel="Error"
            type="error"
            dismissible
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Table
          columnDefinitions={columnDefinitions}
          items={filteredCameras}
          loading={loading}
          loadingText="Loading cameras..."
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          selectionType="multi"
          ariaLabels={{
            selectionGroupLabel: "Items selection",
            allItemsSelectionLabel: ({ selectedItems }) =>
              `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "items"} selected`,
            itemSelectionLabel: ({ selectedItems }, item) => {
              const isItemSelected = selectedItems.filter(i => i.camera_id === item.camera_id).length;
              return `${item.camera_name} is ${isItemSelected ? "" : "not"} selected`;
            }
          }}
          renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) =>
            `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
          }
          variant="full-page"
          stickyHeader
          header={
            <Header
              counter={`(${cameras.length})`}
              actions={
                <SpaceBetween direction="horizontal" >
                  <Button
                    disabled={selectedItems.length === 0}
                    onClick={() => {
                      // Handle bulk actions
                      console.log('Bulk actions for:', selectedItems);
                    }}
                  >
                    Actions
                  </Button>
                </SpaceBetween>
              }
            >
              Cameras
            </Header>
          }
          filter={
            <TextFilter
              filteringText={filteringText}
              onChange={({ detail }) => setFilteringText(detail.filteringText)}
              filteringPlaceholder="Search cameras..."
              countText={`${filteredCameras.length} ${filteredCameras.length === 1 ? 'match' : 'matches'}`}
            />
          }
          pagination={
            <Pagination
              currentPageIndex={currentPageIndex}
              onChange={({ detail }) => handlePageChange(detail.currentPageIndex)}
              pagesCount={Math.ceil(cameras.length / preferences.pageSize)}
              ariaLabels={{
                nextPageLabel: "Next page",
                previousPageLabel: "Previous page",
                pageLabel: pageNumber => `Page ${pageNumber} of all pages`
              }}
            />
          }
          preferences={
            <CollectionPreferences
              title="Preferences"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              preferences={preferences}
              onConfirm={({ detail }) => {
                const newPreferences = {
                  pageSize: detail.pageSize || 10,
                  visibleContent: detail.visibleContent || ['camera_name', 'thumbnail', 'make_model', 'installation_location', 'test_status', 'created_at', 'actions']
                };
                setPreferences(newPreferences);
              }}
              pageSizePreference={{
                title: "Page size",
                options: [
                  { value: 10, label: "10 cameras" },
                  { value: 20, label: "20 cameras" },
                  { value: 50, label: "50 cameras" }
                ]
              }}
              visibleContentPreference={{
                title: "Select visible columns",
                options: [
                  {
                    label: "Camera properties",
                    options: [
                      { id: "camera_name", label: "Camera Name", editable: false },
                      { id: "thumbnail", label: "Preview Thumbnail" },
                      { id: "make_model", label: "Make & Model" },
                      { id: "installation_location", label: "Location" },
                      { id: "ml_model", label: "ML Model" },
                      { id: "retention_hours", label: "Retention Hours" },
                      { id: "test_status", label: "Test Status" },
                      { id: "created_at", label: "Created" },
                      { id: "actions", label: "Actions", editable: false }
                    ]
                  }
                ]
              }}
            />
          }
          empty={
            <Box textAlign="center" color="inherit">
              <SpaceBetween >
                <b>No cameras found</b>
                <Box variant="p" color="inherit">
                  You haven't added any cameras yet.
                </Box>
                <Button
                  variant="primary"
                  onClick={() => window.location.hash = 'add-camera'}
                >
                  Add your first camera
                </Button>
              </SpaceBetween>
            </Box>
          }
        />

        <Modal
          onDismiss={() => setDeleteModalVisible(false)}
          visible={deleteModalVisible}
          closeAriaLabel="Close modal"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" >
                <Button variant="link" onClick={() => setDeleteModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => deletingCamera && deleteCamera(deletingCamera)}
                >
                  Delete
                </Button>
              </SpaceBetween>
            </Box>
          }
          header="Delete camera"
        >
          {deletingCamera && (
            <SpaceBetween >
              <Box variant="span">
                Are you sure you want to delete camera <b>{deletingCamera.camera_name}</b>?
              </Box>
              <Alert type="warning" statusIconAriaLabel="Warning">
                This action cannot be undone. The camera configuration and associated RTSP credentials will be permanently deleted.
              </Alert>
            </SpaceBetween>
          )}
        </Modal>
      </SpaceBetween>
    </Container>
  );
};

export default CameraList;
